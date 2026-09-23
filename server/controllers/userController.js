const bcrypt = require("bcryptjs");
const User = require("../models/User");

const VALID_ROLES = [
  "student",
  "advisor",
  "admin",
];

const safeUser = (user) => {
  const object = user.toObject();

  delete object.passwordHash;

  return object;
};


// ======================================================
// GET ALL USERS
// ======================================================

const getUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) {
      if (!VALID_ROLES.includes(req.query.role)) {
        return res.status(400).json({
          message: "Invalid role filter.",
        });
      }

      filter.role = req.query.role;
    }

    if (req.query.active !== undefined) {
      filter.active = req.query.active === "true";
    }

    const users = await User.find(filter)
      .select("-passwordHash")
      .sort({ name: 1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Could not retrieve users.",
    });
  }
};


// ======================================================
// GET ONE USER
// ======================================================

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({
      message: "Invalid user ID.",
    });
  }
};


// ======================================================
// CREATE USER
// ======================================================

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentId,
      advisorId,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message:
          "Name, email, password and role are required.",
      });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    if (role === "student" && !studentId) {
      return res.status(400).json({
        message:
          "Student ID is required for students.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const duplicateConditions = [
      {
        email: normalizedEmail,
      },
    ];

    if (studentId) {
      duplicateConditions.push({
        studentId,
      });
    }

    const existingUser =
      await User.findOne({
        $or: duplicateConditions,
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          "Email or student ID already exists.",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),

      email: normalizedEmail,

      passwordHash,

      role,

      studentId:
        role === "student"
          ? studentId
          : undefined,

      advisorId:
        advisorId || null,

      active: true,
    });

    return res.status(201).json({
      message:
        "User created successfully.",

      user: safeUser(user),
    });
  } catch (error) {
    console.error("Create user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Email or student ID already exists.",
      });
    }

    return res.status(500).json({
      message: "Could not create user.",
    });
  }
};


// ======================================================
// UPDATE USER
// ======================================================

const updateUser = async (req, res) => {
  try {
    const user =
      await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const {
      name,
      email,
      role,
      studentId,
      advisorId,
      active,
    } = req.body;

    if (
      role !== undefined &&
      !VALID_ROLES.includes(role)
    ) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    const nextRole =
      role !== undefined
        ? role
        : user.role;

    const nextActive =
      active !== undefined
        ? active
        : user.active;


    // Protect last active admin

    if (
      user.role === "admin" &&
      user.active &&
      (
        nextRole !== "admin" ||
        nextActive === false
      )
    ) {
      const activeAdmins =
        await User.countDocuments({
          role: "admin",
          active: true,
        });

      if (activeAdmins <= 1) {
        return res.status(400).json({
          message:
            "Cannot remove or deactivate the last active admin.",
        });
      }
    }


    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      user.email =
        email.trim().toLowerCase();
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (advisorId !== undefined) {
      user.advisorId =
        advisorId || null;
    }

    if (active !== undefined) {
      user.active = active;
    }


    if (user.role === "student") {
      if (studentId !== undefined) {
        user.studentId = studentId;
      }

      if (!user.studentId) {
        return res.status(400).json({
          message:
            "Student ID is required for student accounts.",
        });
      }
    } else {
      user.studentId = undefined;
    }


    await user.save();


    return res.status(200).json({
      message:
        "User updated successfully.",

      user: safeUser(user),
    });
  } catch (error) {
    console.error("Update user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Email or student ID already exists.",
      });
    }

    return res.status(400).json({
      message: "Could not update user.",
    });
  }
};


// ======================================================
// DELETE / DEACTIVATE USER
// ======================================================

const deleteUser = async (req, res) => {
  try {
    const targetUser =
      await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }


    // Admin cannot delete themselves

    if (
      req.user.id ===
      targetUser._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot delete your own account.",
      });
    }


    // Never allow zero active admins

    if (
      targetUser.role === "admin" &&
      targetUser.active
    ) {
      const activeAdmins =
        await User.countDocuments({
          role: "admin",
          active: true,
        });

      if (activeAdmins <= 1) {
        return res.status(400).json({
          message:
            "Cannot delete the last active admin.",
        });
      }
    }


    // Soft delete

    targetUser.active = false;

    await targetUser.save();


    return res.status(200).json({
      message:
        "User deactivated successfully.",

      user: safeUser(targetUser),
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(400).json({
      message: "Invalid user ID.",
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};