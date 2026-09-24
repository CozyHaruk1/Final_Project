const mongoose = require("mongoose");

const User = require("../models/User");
const Course = require("../models/Course");
const Offering = require("../models/Offering");
const Registration = require("../models/Registration");
const Record = require("../models/Record");
const Notification = require("../models/Notification");

const PASSING_GRADES = [
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D",
];

const CURRENT_TERM = process.env.CURRENT_TERM || "2026-1";


// ======================================================
// HELPERS
// ======================================================

const findStudent = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await User.findOne({
      _id: identifier,
      role: "student",
    });

    if (byId) return byId;
  }

  return User.findOne({
    studentId: identifier,
    role: "student",
  });
};


const timesOverlap = (offeringA, offeringB) => {
  if (offeringA.day !== offeringB.day) {
    return false;
  }

  return (
    offeringA.startTime < offeringB.endTime &&
    offeringA.endTime > offeringB.startTime
  );
};


const getStudentRecords = async (studentObjectId) => {
  return Record.find({
    studentId: studentObjectId,
  }).populate(
    "courseId",
    "code title credits prerequisites"
  );
};


const getCurrentRegistrations = async (
  studentObjectId,
  term
) => {
  return Registration.find({
    studentId: studentObjectId,
    term,
    status: "registered",
  }).populate({
    path: "offeringId",
    populate: {
      path: "courseId",
      select: "code title credits prerequisites",
    },
  });
};

const createStudentNotification =
  async (
    userId,
    type,
    message
  ) => {
    try {
      await Notification.create({
        userId,
        type,
        message,
        read: false,
      });
    } catch (error) {
      /*
        Notification failure should
        never cancel a successful
        registration change.
      */

      console.error(
        "Notification creation error:",
        error
      );
    }
  };

// ======================================================
// STUDENT RECORD
// GET /api/students/:id/record
// ======================================================

const getStudentRecord = async (req, res) => {
  try {
    const student = await findStudent(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const records = await Record.find({
      studentId: student._id,
    })
      .populate(
        "courseId",
        "code title credits"
      )
      .sort({
        term: 1,
      });

    let totalCreditsEarned = 0;

    const formattedRecords = records.map((record) => {
      const passed =
        PASSING_GRADES.includes(record.grade);

      if (passed && record.courseId) {
        totalCreditsEarned +=
          record.courseId.credits;
      }

      return {
        id: record._id,

        term: record.term,

        course: record.courseId,

        grade: record.grade,

        passed,

        retakeRequired:
          record.grade === "F",
      };
    });

    const groupedByTerm = {};

    for (const record of formattedRecords) {
      if (!groupedByTerm[record.term]) {
        groupedByTerm[record.term] = [];
      }

      groupedByTerm[record.term].push(record);
    }

    return res.status(200).json({
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
      },

      totalCreditsEarned,

      records: formattedRecords,

      groupedByTerm,
    });
  } catch (error) {
    console.error(
      "Get student record error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve student record.",
    });
  }
};


// ======================================================
// ELIGIBILITY RULES ENGINE
// GET /api/students/:id/eligible?term=2026-1
// ======================================================

const getEligibleCourses = async (req, res) => {
  try {
    const student = await findStudent(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const term =
      req.query.term || CURRENT_TERM;

    const [
      courses,
      offerings,
      records,
      registrations,
    ] = await Promise.all([
      Course.find({}).sort({
        code: 1,
      }),

      Offering.find({
        term,
      }).populate(
        "courseId",
        "code title credits prerequisites"
      ),

      getStudentRecords(student._id),

      getCurrentRegistrations(
        student._id,
        term
      ),
    ]);

    /*
      Completed course information
    */

    const passedCourseCodes = new Map();

    const failedCourseCodes = new Set();

    for (const record of records) {
      if (!record.courseId) {
        continue;
      }

      const code = record.courseId.code;

      if (
        PASSING_GRADES.includes(record.grade)
      ) {
        passedCourseCodes.set(
          code,
          record.grade
        );
      }

      if (record.grade === "F") {
        failedCourseCodes.add(code);
      }
    }

    /*
      Current registered offerings
    */

    const registeredOfferings =
      registrations
        .map(
          (registration) =>
            registration.offeringId
        )
        .filter(Boolean);

    const result = [];

    for (const course of courses) {
      const courseOfferings =
        offerings.filter(
          (offering) =>
            offering.courseId &&
            offering.courseId._id.toString() ===
              course._id.toString()
        );

      const alreadyPassed =
        passedCourseCodes.has(
          course.code
        );

      const retakeRequired =
        failedCourseCodes.has(
          course.code
        ) &&
        !alreadyPassed;


      // ==================================================
      // RULE 1 — OFFERED THIS TERM
      // ==================================================

      if (courseOfferings.length === 0) {
        result.push({
          course,

          eligible: false,

          retakeRequired,

          reason:
            "Not offered this term",

          sections: [],
        });

        continue;
      }


      // ==================================================
      // RULE 2 — ALREADY PASSED
      // ==================================================

      if (alreadyPassed) {
        const grade =
          passedCourseCodes.get(
            course.code
          );

        result.push({
          course,

          eligible: false,

          retakeRequired: false,

          reason:
            `Already passed — grade ${grade}`,

          sections:
            courseOfferings.map(
              (offering) => ({
                ...offering.toObject(),

                seatsRemaining:
                  Math.max(
                    0,
                    offering.seats -
                      offering.seatsTaken
                  ),

                eligible: false,

                reason:
                  `Already passed — grade ${grade}`,
              })
            ),
        });

        continue;
      }


      // ==================================================
      // PREREQUISITES
      // ==================================================

      const missingPrerequisites =
        course.prerequisites.filter(
          (prerequisiteCode) =>
            !passedCourseCodes.has(
              prerequisiteCode
            )
        );

      if (
        missingPrerequisites.length > 0
      ) {
        result.push({
          course,

          eligible: false,

          retakeRequired,

          reason:
            `Missing prerequisite: ${missingPrerequisites.join(
              ", "
            )}`,

          sections:
            courseOfferings.map(
              (offering) => ({
                ...offering.toObject(),

                seatsRemaining:
                  Math.max(
                    0,
                    offering.seats -
                      offering.seatsTaken
                  ),

                eligible: false,

                reason:
                  `Missing prerequisite: ${missingPrerequisites.join(
                    ", "
                  )}`,
              })
            ),
        });

        continue;
      }


      // ==================================================
      // CHECK EVERY SECTION
      // ==================================================

      const sections = [];

      for (
        const offering of courseOfferings
      ) {
        let eligible = true;
        let reason = null;


        // Already registered for same course

        const sameCourse =
          registeredOfferings.find(
            (registeredOffering) =>
              registeredOffering.courseId &&
              registeredOffering.courseId._id.toString() ===
                course._id.toString()
          );

        if (sameCourse) {
          eligible = false;

          reason =
            `Already registered — ${course.code} Section ${sameCourse.section}`;
        }


        // ================================================
        // RULE 3 — SEATS
        // ================================================

        else if (
          offering.seatsTaken >=
          offering.seats
        ) {
          eligible = false;

          reason =
            "Full — 0 seats";
        }


        // ================================================
        // RULE 4 — TIME CLASH
        // ================================================

        else {
          const clash =
            registeredOfferings.find(
              (registeredOffering) =>
                timesOverlap(
                  offering,
                  registeredOffering
                )
            );

          if (clash) {
            eligible = false;

            reason =
              `Clashes with ${clash.courseId.code} Section ${clash.section}`;
          }
        }


        sections.push({
          ...offering.toObject(),

          seatsRemaining:
            Math.max(
              0,
              offering.seats -
                offering.seatsTaken
            ),

          full:
            offering.seatsTaken >=
            offering.seats,

          eligible,

          reason,
        });
      }


      const courseEligible =
        sections.some(
          (section) =>
            section.eligible
        );


      result.push({
        course,

        eligible:
          courseEligible,

        retakeRequired,

        reason:
          courseEligible
            ? retakeRequired
              ? "Retake required"
              : null
            : "No eligible sections available",

        sections,
      });
    }


    /*
      Failed courses first
    */

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

      return a.course.code.localeCompare(
        b.course.code
      );
    });


    return res.status(200).json({
      student: {
        id: student._id,
        studentId:
          student.studentId,
        name: student.name,
      },

      term,

      courses: result,
    });
  } catch (error) {
    console.error(
      "Eligibility error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not determine eligible courses.",
    });
  }
};


// ======================================================
// REGISTER STUDENT
// POST /api/registrations
// ======================================================

const registerStudent = async (req, res) => {
  try {
    const {
      studentId,
      offeringId,
    } = req.body;

    if (!studentId || !offeringId) {
      return res.status(400).json({
        message:
          "Student ID and offering ID are required.",
      });
    }

    const student =
      await findStudent(studentId);

    if (!student) {
      return res.status(404).json({
        message:
          "Student not found.",
      });
    }

    const offering =
      await Offering.findById(
        offeringId
      ).populate(
        "courseId",
        "code title credits prerequisites"
      );

    if (!offering) {
      return res.status(404).json({
        message:
          "Offering not found.",
      });
    }

    const course =
      offering.courseId;

    const term =
      offering.term;


    // ==================================================
    // RECORDS
    // ==================================================

    const records =
      await getStudentRecords(
        student._id
      );

    const passedCodes =
      new Map();

    for (const record of records) {
      if (
        record.courseId &&
        PASSING_GRADES.includes(
          record.grade
        )
      ) {
        passedCodes.set(
          record.courseId.code,
          record.grade
        );
      }
    }


    // Already passed

    if (
      passedCodes.has(course.code)
    ) {
      return res.status(409).json({
        message:
          `Already passed — grade ${passedCodes.get(
            course.code
          )}`,
      });
    }


    // Prerequisites

    const missingPrerequisites =
      course.prerequisites.filter(
        (code) =>
          !passedCodes.has(code)
      );

    if (
      missingPrerequisites.length > 0
    ) {
      return res.status(409).json({
        message:
          `Missing prerequisite: ${missingPrerequisites.join(
            ", "
          )}`,
      });
    }


    // ==================================================
    // SEATS
    // ==================================================

    if (
      offering.seatsTaken >=
      offering.seats
    ) {
      return res.status(409).json({
        message:
          "Full — 0 seats",
      });
    }


    // ==================================================
    // CURRENT REGISTRATIONS
    // ==================================================

    const currentRegistrations =
      await getCurrentRegistrations(
        student._id,
        term
      );


    // Same course

    const duplicateCourse =
      currentRegistrations.find(
        (registration) =>
          registration.offeringId &&
          registration.offeringId.courseId &&
          registration.offeringId.courseId._id.toString() ===
            course._id.toString()
      );

    if (duplicateCourse) {
      return res.status(409).json({
        message:
          `Already registered — ${course.code} Section ${duplicateCourse.offeringId.section}`,
      });
    }


    // Time clash

    const clash =
      currentRegistrations.find(
        (registration) =>
          registration.offeringId &&
          timesOverlap(
            offering,
            registration.offeringId
          )
      );

    if (clash) {
      return res.status(409).json({
        message:
          `Clashes with ${clash.offeringId.courseId.code} Section ${clash.offeringId.section}`,
      });
    }


    // ==================================================
    // CREATE / REACTIVATE REGISTRATION
    // ==================================================

    let registration =
      await Registration.findOne({
        studentId: student._id,
        offeringId:
          offering._id,
      });

    if (registration) {
      if (
        registration.status ===
        "registered"
      ) {
        return res.status(409).json({
          message:
            "Student is already registered for this section.",
        });
      }

      registration.status =
        "registered";

      registration.term =
        term;

      await registration.save();
    } else {
      registration =
        await Registration.create({
          studentId:
            student._id,

          offeringId:
            offering._id,

          term,

          status:
            "registered",
        });
    }


    // ==================================================
    // UPDATE SEATS
    // ==================================================

    offering.seatsTaken += 1;
    await offering.save();

    await createStudentNotification(
    student._id,
     "course_registered",
    `${course.code} - ${course.title} was added to your schedule.`
    );

    await registration.populate({
      path: "offeringId",
      populate: {
        path: "courseId",
        select:
          "code title credits",
      },
    });


    return res.status(201).json({
      message:
        "Student registered successfully.",

      registration,
    });
  } catch (error) {
    console.error(
      "Register student error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not register student.",
    });
  }
};


// ======================================================
// REMOVE REGISTRATION
// DELETE /api/registrations/:id
// ======================================================

const removeRegistration = async (
  req,
  res
) => {
  try {
    const registration =
      await Registration.findById(
        req.params.id
      );

    if (!registration) {
      return res.status(404).json({
        message:
          "Registration not found.",
      });
    }

    if (
      registration.status ===
      "dropped"
    ) {
      return res.status(400).json({
        message:
          "Registration is already dropped.",
      });
    }

    registration.status =
      "dropped";

    await registration.save();

    const offering =
    await Offering.findById(
      registration.offeringId
      ).populate(
      "courseId",
      "code title"
    );

    if (
      offering &&
      offering.seatsTaken > 0
    ) {
      offering.seatsTaken -= 1;

      await offering.save();
    }

    if (offering?.courseId) {
      await createStudentNotification(
    registration.studentId,

    "course_dropped",

    `${offering.courseId.code} - ${offering.courseId.title} was removed from your schedule.`
  );
}

    return res.status(200).json({
      message:
        "Registration removed successfully.",
    });
  } catch (error) {
    console.error(
      "Remove registration error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not remove registration.",
    });
  }
};


// ======================================================
// STUDENT CURRENT REGISTRATIONS
// GET /api/me/registrations
// ======================================================

const getMyRegistrations = async (
  req,
  res
) => {
  try {
    const term =
      req.query.term ||
      CURRENT_TERM;

    const registrations =
      await Registration.find({
        studentId:
          req.user.id,

        term,

        status:
          "registered",
      }).populate({
        path: "offeringId",

        populate: {
          path: "courseId",

          select:
            "code title credits description prerequisites",
        },
      });


    const student =
      await User.findById(
        req.user.id
      ).populate(
        "advisorId",
        "name email"
      );


    const formatted =
      registrations.map(
        (registration) => {
          const offering =
            registration.offeringId;

          return {
            id:
              registration._id,

            status:
              registration.status,

            term:
              registration.term,

            offering:
              offering
                ? {
                    ...offering.toObject(),

                    seatsRemaining:
                      Math.max(
                        0,
                        offering.seats -
                          offering.seatsTaken
                      ),
                  }
                : null,
          };
        }
      );


    return res.status(200).json({
      term,

      advisor:
        student?.advisorId ||
        null,

      registrations:
        formatted,
    });
  } catch (error) {
    console.error(
      "Get my registrations error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve registrations.",
    });
  }
};


// ======================================================
// STUDENT OWN RECORD
// GET /api/me/record
// ======================================================

const getMyRecord = async (req, res) => {
  try {
    const student =
      await User.findOne({
        _id: req.user.id,
        role: "student",
      });

    if (!student) {
      return res.status(404).json({
        message:
          "Student not found.",
      });
    }

    req.params.id =
      student._id.toString();

    return getStudentRecord(
      req,
      res
    );
  } catch (error) {
    console.error(
      "Get my record error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve academic record.",
    });
  }
};


module.exports = {
  getStudentRecord,
  getEligibleCourses,
  registerStudent,
  removeRegistration,
  getMyRegistrations,
  getMyRecord,
};