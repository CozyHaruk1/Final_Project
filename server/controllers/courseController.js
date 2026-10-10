const Course = require("../models/Course");
const Offering = require("../models/Offering");


// ======================================================
// GET ALL COURSES
// GET /api/courses
// Student, Advisor, Admin
// Optional:
//   ?search=web
//   ?term=2026-1
// ======================================================

const getCourses = async (req, res) => {
  try {
    const filter = {};

    // Search by course code or title
    if (req.query.search) {
      const search = req.query.search.trim();

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

    /*
    |--------------------------------------------------------------------------
    | Optional term information
    |--------------------------------------------------------------------------
    |
    | If the frontend sends:
    |
    | GET /api/courses?term=2026-1
    |
    | we attach current offering information to each course.
    |
    | This is useful for Advisor pages without changing the normal
    | /api/courses response when no term is supplied.
    |
    */

    if (req.query.term) {
      const term = req.query.term.trim();

      const offerings = await Offering.find({
        term,
      })
        .populate(
          "courseId",
          "code title credits description prerequisites"
        )
        .sort({
          courseId: 1,
          section: 1,
        });

      const coursesWithOfferings = courses.map(
        (course) => {
          const courseObject = course.toObject();

          const courseOfferings = offerings
            .filter(
              (offering) =>
                offering.courseId?._id?.toString() ===
                course._id.toString()
            )
            .map((offering) => {
              const offeringObject =
                offering.toObject();

              const seatsRemaining = Math.max(
                0,
                Number(offeringObject.seats || 0) -
                  Number(
                    offeringObject.seatsTaken || 0
                  )
              );

              return {
                ...offeringObject,

                seatsRemaining,

                full:
                  seatsRemaining <= 0,
              };
            });

          return {
            ...courseObject,

            offeredThisTerm:
              courseOfferings.length > 0,

            offerings:
              courseOfferings,
          };
        }
      );

      return res.status(200).json(
        coursesWithOfferings
      );
    }

    return res.status(200).json(courses);
  } catch (error) {
    console.error("Get courses error:", error);

    return res.status(500).json({
      message: "Could not retrieve courses.",
    });
  }
};


// ======================================================
// GET ONE COURSE
// GET /api/courses/:id
// Student, Advisor, Admin
// Optional:
//   ?term=2026-1
// ======================================================

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.id
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | If term is supplied, include its sections
    |--------------------------------------------------------------------------
    */

    if (req.query.term) {
      const term = req.query.term.trim();

      const offerings = await Offering.find({
        courseId: course._id,
        term,
      }).sort({
        section: 1,
      });

      const formattedOfferings =
        offerings.map((offering) => {
          const object =
            offering.toObject();

          const seatsRemaining =
            Math.max(
              0,
              Number(object.seats || 0) -
                Number(
                  object.seatsTaken || 0
                )
            );

          return {
            ...object,

            seatsRemaining,

            full:
              seatsRemaining <= 0,
          };
        });

      return res.status(200).json({
        ...course.toObject(),

        offeredThisTerm:
          formattedOfferings.length > 0,

        offerings:
          formattedOfferings,
      });
    }

    return res.status(200).json(course);

  } catch (error) {

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid course ID.",
      });
    }

    console.error("Get course error:", error);

    return res.status(500).json({
      message: "Could not retrieve course.",
    });
  }
};


// ======================================================
// GET COURSES OFFERED IN ONE TERM
// GET /api/courses/offered/:term
// Student, Advisor, Admin
// ======================================================

const getOfferedCoursesByTerm = async (
  req,
  res
) => {
  try {
    const term = req.params.term;

    const offerings = await Offering.find({
      term,
    })
      .populate(
        "courseId",
        "code title credits description prerequisites"
      )
      .sort({
        courseId: 1,
        section: 1,
      });

    const courseMap = new Map();

    for (const offering of offerings) {

      if (!offering.courseId) {
        continue;
      }

      const courseId =
        offering.courseId._id.toString();

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course:
            offering.courseId.toObject(),

          offerings: [],
        });
      }

      const object =
        offering.toObject();

      const seatsRemaining =
        Math.max(
          0,
          Number(object.seats || 0) -
            Number(
              object.seatsTaken || 0
            )
        );

      courseMap
        .get(courseId)
        .offerings.push({
          ...object,

          seatsRemaining,

          full:
            seatsRemaining <= 0,
        });
    }

    return res.status(200).json(
      Array.from(courseMap.values())
    );

  } catch (error) {
    console.error(
      "Get offered courses error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve offered courses.",
    });
  }
};


module.exports = {
  getCourses,
  getCourseById,
  getOfferedCoursesByTerm,
};