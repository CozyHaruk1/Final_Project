const User = require("../models/User");

const publicUserFields = "-passwordHash";

const getUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.active !== undefined) filter.active = req.query.active === "true";

    const users = await User.find(filter).select(publicUserFields);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Could not retrieve users." });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(publicUserFields);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
};

const updateUser = async (req, res) => {
  try {
    const allowedFields = ["name", "email", "studentId", "advisorId"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields were provided." });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select(publicUserFields);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email or student ID already exists." });
    }

    return res.status(400).json({ message: "Could not update user." });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    ).select(publicUserFields);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "User deactivated.", user });
  } catch (error) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
};

module.exports = { getUsers, getUserById, updateUser, deactivateUser };
