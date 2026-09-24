const express = require("express");

// Existing registration controller
const {
  getStudentRecord,
  getEligibleCourses,
  getMyRegistrations,
} = require("../controllers/registrationController");

// New student controller with GPA
const {
  getMyRecord,
} = require("../controllers/studentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/students/:id/record",
  protect,
  authorize("advisor"),
  getStudentRecord
);

router.get(
  "/students/:id/eligible",
  protect,
  authorize("advisor"),
  getEligibleCourses
);

router.get(
  "/me/registrations",
  protect,
  authorize("student"),
  getMyRegistrations
);

router.get(
  "/me/record",
  protect,
  authorize("student"),
  getMyRecord
);

module.exports = router;