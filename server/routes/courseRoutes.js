const express = require("express");

const Course = require("../models/Course");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);


// ======================================================
// GET ALL COURSES
// GET /api/courses
// Student, Advisor, Admin
// ======================================================

router.get(
  "/",
  authorize("student", "advisor", "admin"),
  async (req, res) => {
    try {
      const filter = {};

      if (req.query.search) {
        const search = req.query.search;

        filter.$or = [
          {
            code: {
              $regex: search,
              $options: "i",
            },
          },
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const courses = await Course.find(filter)
        .sort({ code: 1 });

      return res.status(200).json(courses);
    } catch (error) {
      console.error("Get courses error:", error);

      return res.status(500).json({
        message: "Could not retrieve courses.",
      });
    }
  }
);


// ======================================================
// GET ONE COURSE
// GET /api/courses/:id
// ======================================================

router.get(
  "/:id",
  authorize("student", "advisor", "admin"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found.",
        });
      }

      return res.status(200).json(course);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }
  }
);

module.exports = router;