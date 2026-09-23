const express = require("express");

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ======================================================
// ALL USER ROUTES REQUIRE ADMIN
// ======================================================

router.use(protect);
router.use(authorize("admin"));


// ======================================================
// /api/users
// ======================================================

// GET all users
router.get(
  "/",
  getUsers
);

// CREATE new user
router.post(
  "/",
  createUser
);


// ======================================================
// /api/users/:id
// ======================================================

// GET one user
router.get(
  "/:id",
  getUserById
);

// UPDATE user
router.patch(
  "/:id",
  updateUser
);

// DELETE / deactivate user
router.delete(
  "/:id",
  deleteUser
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;