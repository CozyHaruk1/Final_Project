const express = require("express");

const {
  getStudentRecord,
  getEligibleCourses,
  getMyRegistrations,
  getMyRecord,
} = require("../controllers/registrationController");

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