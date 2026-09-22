const express = require("express");
const {
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

const allowSelfOrAdmin = (req, res, next) => {
  if (req.user.role === "admin" || req.user.id === req.params.id) {
    return next();
  }

  return res.status(403).json({ message: "Access denied." });
};

router.get("/", protect, authorize("admin"), getUsers);
router.get("/:id", protect, allowSelfOrAdmin, getUserById);
router.patch("/:id", protect, allowSelfOrAdmin, updateUser);
router.patch("/:id/deactivate", protect, authorize("admin"), deactivateUser);

module.exports = router;
