const express = require("express");

const {
  getCourses,
  getCourseById,
  getOfferedCoursesByTerm,
} = require("../controllers/courseController");

const protect =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);


// ======================================================
// GET ALL COURSES
// GET /api/courses
// ======================================================

router.get(
  "/",
  authorize(
    "student",
    "advisor",
    "admin"
  ),
  getCourses
);


// ======================================================
// GET COURSES OFFERED IN ONE TERM
// GET /api/courses/offered/2026-1
// ======================================================

router.get(
  "/offered/:term",
  authorize(
    "student",
    "advisor",
    "admin"
  ),
  getOfferedCoursesByTerm
);


// ======================================================
// GET ONE COURSE
// GET /api/courses/:id
// ======================================================

router.get(
  "/:id",
  authorize(
    "student",
    "advisor",
    "admin"
  ),
  getCourseById
);


module.exports = router;