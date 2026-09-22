const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

const authResponse = (res, statusCode, user) => {
  const token = createToken(user);

  return res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, advisorId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required.",
      });
    }

    if (!["student", "advisor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    if (role === "student" && !studentId) {
      return res.status(400).json({
        message: "Student ID is required for a student account.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      studentId: role === "student" ? studentId : undefined,
      advisorId: advisorId || null,
    });

    return authResponse(res, 201, user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email or student ID already exists." });
    }

    return res.status(500).json({ message: "Could not create account." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.active) {
      return res.status(403).json({ message: "This account is inactive." });
    }

    return authResponse(res, 200, user);
  } catch (error) {
    return res.status(500).json({ message: "Could not log in." });
  }
};

module.exports = { register, login };
