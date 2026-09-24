const mongoose = require("mongoose");

const User = require("../models/User");
const Course = require("../models/Course");
const Offering = require("../models/Offering");
const Registration = require("../models/Registration");
const Record = require("../models/Record");


// ======================================================
// CONSTANTS
// ======================================================

const CURRENT_TERM = "2026-1";

const PASSING_GRADES = new Set([
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D",
]);

const GRADE_POINTS = {
  A: 4.0,
  "B+": 3.5,
  B: 3.0,
  "C+": 2.5,
  C: 2.0,
  "D+": 1.5,
  D: 1.0,
  F: 0.0,
};


// ======================================================
// GET AUTHENTICATED USER ID
// Supports the JWT structure used by the project.
// ======================================================

const getAuthenticatedUserId = (req) => {
  return (
    req.user?.userId ||
    req.user?.id ||
    req.user?._id
  );
};


// ======================================================
// TIME CLASH CHECK
// ======================================================

const hasTimeClash = (
  firstOffering,
  secondOffering
) => {
  if (
    firstOffering.day !==
    secondOffering.day
  ) {
    return false;
  }

  return (
    firstOffering.startTime <
      secondOffering.endTime &&
    secondOffering.startTime <
      firstOffering.endTime
  );
};


// ======================================================
// CALCULATE ACADEMIC SUMMARY
// ======================================================

const TOTAL_PROGRAM_CREDITS = 160;

const calculateAcademicSummary = (
  records
) => {
  let totalGradePoints = 0;
  let totalGpaCredits = 0;

  const passedCourseIds =
    new Set();

  const passedCourseCodes =
    new Set();

  const failedCourseCodes =
    new Set();


  // ====================================================
  // GPA + PASS / FAIL HISTORY
  // ====================================================

  for (const record of records) {
    const course =
      record.courseId;

    if (!course) {
      continue;
    }

    const courseId =
      course._id.toString();

    const courseCode =
      course.code;


    // ------------------------------------------
    // GPA
    // W is excluded from GPA.
    // F counts as 0.
    // ------------------------------------------

    if (record.grade !== "W") {
      const gradePoint =
        GRADE_POINTS[
          record.grade
        ];

      if (
        gradePoint !== undefined
      ) {
        const credits =
          course.credits || 4;

        totalGradePoints +=
          gradePoint * credits;

        totalGpaCredits +=
          credits;
      }
    }


    // ------------------------------------------
    // PASSED COURSES
    // ------------------------------------------

    if (
      PASSING_GRADES.has(
        record.grade
      )
    ) {
      passedCourseIds.add(
        courseId
      );

      passedCourseCodes.add(
        courseCode
      );
    }


    // ------------------------------------------
    // FAILED COURSES
    // ------------------------------------------

    if (
      record.grade === "F"
    ) {
      failedCourseCodes.add(
        courseCode
      );
    }
  }


  // ====================================================
  // GPA
  // ====================================================

  const gpa =
    totalGpaCredits === 0
      ? 0
      : Number(
          (
            totalGradePoints /
            totalGpaCredits
          ).toFixed(2)
        );


  // ====================================================
  // TOTAL EARNED CREDITS
  // Only successfully passed courses count.
  // Each course counts once.
  // ====================================================

  let totalCredits = 0;

  for (const courseId of passedCourseIds) {
    const record =
      records.find(
        (item) =>
          item.courseId &&
          item.courseId._id.toString() ===
            courseId
      );

    if (record?.courseId) {
      totalCredits +=
        record.courseId.credits || 4;
    }
  }


  // ====================================================
  // GRADUATION PROGRESS
  // ====================================================

  const progress =
    Math.min(
      100,
      Math.round(
        (
          totalCredits /
          TOTAL_PROGRAM_CREDITS
        ) * 100
      )
    );


  // ====================================================
  // UNRESOLVED FAILED COURSES
  // If later passed, retake is no longer required.
  // ====================================================

  const retakeCourses =
    [...failedCourseCodes].filter(
      (code) =>
        !passedCourseCodes.has(
          code
        )
    );


  // ====================================================
  // RETURN SUMMARY
  // ====================================================

  return {
    gpa,

    totalCredits,

    progress,

    passedCourses:
      passedCourseIds.size,

    failedCourses:
      retakeCourses.length,

    retakeCourses,

    passedCourseCodes,

    failedCourseCodes,
  };
};

// ======================================================
// LOAD STUDENT + RECORD
// ======================================================

const loadStudentRecord = async (
  studentId
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      studentId
    )
  ) {
    return null;
  }

  const student =
    await User.findOne({
      _id: studentId,
      role: "student",
    })
      .select(
        "name email studentId advisorId role active"
      )
      .populate(
        "advisorId",
        "name email"
      );

  if (!student) {
    return null;
  }

  const records =
    await Record.find({
      studentId:
        student._id,
    })
      .populate(
        "courseId",
        "code title credits description prerequisites"
      )
      .sort({
        term: 1,
        _id: 1,
      });

  const academicSummary =
    calculateAcademicSummary(
      records
    );

  const formattedRecords =
    records.map((record) => {
      const object =
        record.toObject();

      const courseCode =
        object.courseId?.code;

      return {
        ...object,

        retakeRequired:
          record.grade === "F" &&
          !academicSummary
            .passedCourseCodes
            .has(courseCode),
      };
    });

  return {
    student,
    records:
      formattedRecords,

    academicSummary: {
  gpa:
    academicSummary.gpa,

  totalCredits:
    academicSummary.totalCredits,

  progress:
    academicSummary.progress,

  passedCourses:
    academicSummary.passedCourses,

  failedCourses:
    academicSummary.failedCourses,

  retakeCourses:
    academicSummary.retakeCourses,
},
  };
};


// ======================================================
// GET STUDENT RECORD
// GET /api/students/:id/record
// Advisor + own student
// ======================================================

const getStudentRecord = async (
  req,
  res
) => {
  try {
    const requestedStudentId =
      req.params.id;

    const loggedInUserId =
      getAuthenticatedUserId(req);

    const role =
      req.user?.role;

    /*
      Students can only view
      their own record.
    */
    if (
      role === "student" &&
      String(loggedInUserId) !==
        String(
          requestedStudentId
        )
    ) {
      return res.status(403).json({
        message:
          "You can only view your own academic record.",
      });
    }

    if (
      role !== "student" &&
      role !== "advisor"
    ) {
      return res.status(403).json({
        message:
          "Access denied.",
      });
    }

    const data =
      await loadStudentRecord(
        requestedStudentId
      );

    if (!data) {
      return res.status(404).json({
        message:
          "Student not found.",
      });
    }

    return res.status(200).json(
      data
    );

  } catch (error) {
    console.error(
      "Get student record error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve academic record.",
    });
  }
};


// ======================================================
// GET MY RECORD
// GET /api/me/record
// Student
// ======================================================

const getMyRecord = async (
  req,
  res
) => {
  try {
    const studentId =
      getAuthenticatedUserId(req);

    if (!studentId) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    const data =
      await loadStudentRecord(
        studentId
      );

    if (!data) {
      return res.status(404).json({
        message:
          "Student record not found.",
      });
    }

    return res.status(200).json(
      data
    );

  } catch (error) {
    console.error(
      "Get my record error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve your academic record.",
    });
  }
};


// ======================================================
// GET MY CURRENT REGISTRATIONS
// GET /api/me/registrations
// Student
// ======================================================

const getMyRegistrations = async (
  req,
  res
) => {
  try {
    const studentId =
      getAuthenticatedUserId(req);

    const term =
      req.query.term ||
      CURRENT_TERM;

    if (!studentId) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    const registrations =
      await Registration.find({
        studentId,
        term,
        status: "registered",
      })
        .populate({
          path: "offeringId",

          populate: {
            path: "courseId",

            select:
              "code title credits description prerequisites",
          },
        })
        .sort({
          createdAt: 1,
        });

    const formatted =
      registrations
        .filter(
          (registration) =>
            registration.offeringId
        )
        .map(
          (registration) => {
            const object =
              registration.toObject();

            const offering =
              object.offeringId;

            const seatsRemaining =
              Math.max(
                0,
                offering.seats -
                  offering.seatsTaken
              );

            return {
              ...object,

              offeringId: {
                ...offering,

                seatsRemaining,

                full:
                  offering.seatsTaken >=
                  offering.seats,
              },
            };
          }
        );

    const totalCredits =
      formatted.reduce(
        (
          total,
          registration
        ) =>
          total +
          (
            registration
              .offeringId
              ?.courseId
              ?.credits || 0
          ),
        0
      );

    return res.status(200).json({
      term,

      registrationCount:
        formatted.length,

      currentCredits:
        totalCredits,

      registrations:
        formatted,
    });

  } catch (error) {
    console.error(
      "Get registrations error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve current registrations.",
    });
  }
};


// ======================================================
// GET ELIGIBLE COURSES
// GET /api/students/:id/eligible?term=2026-1
// Advisor only
// ======================================================

const getEligibleCourses = async (
  req,
  res
) => {
  try {
    const studentId =
      req.params.id;

    const term =
      req.query.term ||
      CURRENT_TERM;

    if (
      !mongoose.Types.ObjectId.isValid(
        studentId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid student ID.",
      });
    }

    const student =
      await User.findOne({
        _id: studentId,
        role: "student",
      }).select(
        "name email studentId advisorId active"
      );

    if (!student) {
      return res.status(404).json({
        message:
          "Student not found.",
      });
    }

    // ==================================================
    // PREVIOUS ACADEMIC HISTORY
    // ==================================================

    const records =
      await Record.find({
        studentId:
          student._id,
      })
        .populate(
          "courseId",
          "code title credits prerequisites"
        )
        .sort({
          term: 1,
          _id: 1,
        });

    const summary =
      calculateAcademicSummary(
        records
      );

    const passedCodes =
      summary.passedCourseCodes;

    const failedCodes =
      summary.failedCourseCodes;

    /*
      Last passing grade for each
      completed course.
    */
    const passingGradeByCode =
      new Map();

    for (const record of records) {
      if (
        record.courseId &&
        PASSING_GRADES.has(
          record.grade
        )
      ) {
        passingGradeByCode.set(
          record.courseId.code,
          record.grade
        );
      }
    }

    // ==================================================
    // CURRENT REGISTRATIONS
    // ==================================================

    const currentRegistrations =
      await Registration.find({
        studentId:
          student._id,

        term,

        status:
          "registered",
      }).populate({
        path: "offeringId",

        populate: {
          path:
            "courseId",

          select:
            "code title credits",
        },
      });

    const currentOfferings =
      currentRegistrations
        .map(
          (registration) =>
            registration.offeringId
        )
        .filter(Boolean);

    const registeredCourseCodes =
      new Set(
        currentOfferings
          .map(
            (offering) =>
              offering.courseId
                ?.code
          )
          .filter(Boolean)
      );

    // ==================================================
    // ALL COURSES + CURRENT TERM OFFERINGS
    // ==================================================

    const courses =
      await Course.find({})
        .sort({
          code: 1,
        });

    const offerings =
      await Offering.find({
        term,
      })
        .populate(
          "courseId",
          "code title credits prerequisites"
        )
        .sort({
          section: 1,
        });

    const result = [];

    for (const course of courses) {
      const courseOfferings =
        offerings.filter(
          (offering) =>
            offering.courseId &&
            offering.courseId._id
              .toString() ===
              course._id.toString()
        );

      const alreadyPassed =
        passedCodes.has(
          course.code
        );

      const retakeRequired =
        failedCodes.has(
          course.code
        ) &&
        !alreadyPassed;

      // ----------------------------------------------
      // COURSE IS NOT OFFERED THIS TERM
      // ----------------------------------------------

      if (
        courseOfferings.length === 0
      ) {
        result.push({
          courseId:
            course._id,

          code:
            course.code,

          title:
            course.title,

          credits:
            course.credits,

          prerequisites:
            course.prerequisites,

          offered:
            false,

          retakeRequired,

          eligible:
            false,

          reason:
            "Not offered this term.",

          sections: [],
        });

        continue;
      }

      // ----------------------------------------------
      // CHECK EACH SECTION
      // ----------------------------------------------

      const sections =
        courseOfferings.map(
          (offering) => {
            const reasons = [];

            const seatsRemaining =
              Math.max(
                0,
                offering.seats -
                  offering.seatsTaken
              );

            const full =
              seatsRemaining <= 0;

            // Already passed
            if (alreadyPassed) {
              const grade =
                passingGradeByCode.get(
                  course.code
                );

              reasons.push(
                `Already passed — grade ${grade}`
              );
            }

            // Already registered
            if (
              registeredCourseCodes.has(
                course.code
              )
            ) {
              reasons.push(
                "Already registered this term."
              );
            }

            // Prerequisites
            // Failed-course retakes are allowed
            // without rechecking prerequisite history.
            if (!retakeRequired) {
              const missingPrerequisites =
                (
                  course.prerequisites ||
                  []
                ).filter(
                  (code) =>
                    !passedCodes.has(
                      code
                    )
                );

              if (
                missingPrerequisites.length >
                0
              ) {
                reasons.push(
                  `Prerequisite not met — requires ${missingPrerequisites.join(
                    ", "
                  )}`
                );
              }
            }

            // Full section
            if (full) {
              reasons.push(
                "Full — 0 seats remaining."
              );
            }

            // Time clash
            const clash =
              currentOfferings.find(
                (
                  currentOffering
                ) =>
                  currentOffering &&
                  currentOffering
                    ._id
                    .toString() !==
                    offering._id
                      .toString() &&
                  hasTimeClash(
                    offering,
                    currentOffering
                  )
              );

            if (clash) {
              const clashCode =
                clash.courseId
                  ?.code ||
                "another course";

              reasons.push(
                `Clashes with ${clashCode} Section ${clash.section}`
              );
            }

            return {
              offeringId:
                offering._id,

              section:
                offering.section,

              day:
                offering.day,

              startTime:
                offering.startTime,

              endTime:
                offering.endTime,

              room:
                offering.room,

              instructor:
                offering.instructor,

              seats:
                offering.seats,

              seatsTaken:
                offering.seatsTaken,

              seatsRemaining,

              full,

              addDropOpen:
                offering.addDropOpen,

              addDropCloseDate:
                offering.addDropCloseDate,

              eligible:
                reasons.length ===
                0,

              reasons,
            };
          }
        );

      result.push({
        courseId:
          course._id,

        code:
          course.code,

        title:
          course.title,

        credits:
          course.credits,

        prerequisites:
          course.prerequisites,

        offered:
          true,

        retakeRequired,

        eligible:
          sections.some(
            (section) =>
              section.eligible
          ),

        sections,
      });
    }

    // ==================================================
    // RETAKE REQUIRED FIRST
    // ==================================================

    result.sort((a, b) => {
      if (
        a.retakeRequired &&
        !b.retakeRequired
      ) {
        return -1;
      }

      if (
        !a.retakeRequired &&
        b.retakeRequired
      ) {
        return 1;
      }

      return a.code.localeCompare(
        b.code
      );
    });

    return res.status(200).json({
      student: {
        _id:
          student._id,

        studentId:
          student.studentId,

        name:
          student.name,

        email:
          student.email,
      },

      term,

      academicSummary: {
  gpa:
    summary.gpa,

  totalCredits:
    summary.totalCredits,

  progress:
    summary.progress,

  passedCourses:
    summary.passedCourses,

  failedCourses:
    summary.failedCourses,

  retakeCourses:
    summary.retakeCourses,
},

      currentRegistration: {
        courses:
          currentRegistrations.length,

        credits:
          currentOfferings.reduce(
            (
              total,
              offering
            ) =>
              total +
              (
                offering
                  ?.courseId
                  ?.credits ||
                0
              ),
            0
          ),
      },

      courses:
        result,
    });

  } catch (error) {
    console.error(
      "Eligible courses error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not determine eligible courses.",
    });
  }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getStudentRecord,
  getMyRecord,
  getMyRegistrations,
  getEligibleCourses,
};