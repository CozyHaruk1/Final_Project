const express = require("express");

// Student controller: record, eligible, GPA, my-record
const {
  getStudentRecord,
  getEligibleCourses,
  getMyRecord,
  getMyRegistrations,
} = require("../controllers/studentController");

// Search + advisor registrations list controller
const {
  searchStudents,
  getStudentRegistrations,
} = require("../controllers/studentSearchController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/students",
  protect,
  authorize("advisor"),
  searchStudents
);

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
  "/students/:id/registrations",
  protect,
  authorize("advisor"),
  getStudentRegistrations
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
