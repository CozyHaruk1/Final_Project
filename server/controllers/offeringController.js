const Offering = require("../models/Offering");
const Course = require("../models/Course");
const Registration = require("../models/Registration");


// ======================================================
// FORMAT OFFERING
// ======================================================

const formatOffering = (offering) => {
  const object = offering.toObject
    ? offering.toObject()
    : offering;

  return {
    ...object,
    seatsRemaining: Math.max(
      0,
      object.seats - object.seatsTaken
    ),
    full: object.seatsTaken >= object.seats,
  };
};


// ======================================================
// GET OFFERINGS
// GET /api/offerings?term=2026-1
// Student + Advisor
// ======================================================

const getOfferings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.term) {
      filter.term = req.query.term;
    }

    const offerings = await Offering.find(filter)
      .populate(
        "courseId",
        "code title credits description prerequisites"
      )
      .sort({
        term: 1,
        courseId: 1,
        section: 1,
      });

    return res.status(200).json(
      offerings.map(formatOffering)
    );
  } catch (error) {
    console.error("Get offerings error:", error);

    return res.status(500).json({
      message: "Could not retrieve offerings.",
    });
  }
};


// ======================================================
// GET ONE OFFERING
// GET /api/offerings/:id
// ======================================================

const getOfferingById = async (req, res) => {
  try {
    const offering = await Offering.findById(
      req.params.id
    ).populate(
      "courseId",
      "code title credits description prerequisites"
    );

    if (!offering) {
      return res.status(404).json({
        message: "Offering not found.",
      });
    }

    return res.status(200).json(
      formatOffering(offering)
    );
  } catch (error) {
    return res.status(400).json({
      message: "Invalid offering ID.",
    });
  }
};


// ======================================================
// CREATE OFFERING
// POST /api/offerings
// Advisor only
// ======================================================

const createOffering = async (req, res) => {
  try {
    const {
      courseId,
      term,
      section,
      instructor,
      day,
      startTime,
      endTime,
      room,
      seats,
      addDropOpen,
      addDropCloseDate,
    } = req.body;

    if (
      !courseId ||
      !term ||
      !section ||
      !instructor ||
      !day ||
      !startTime ||
      !endTime ||
      !room ||
      !seats
    ) {
      return res.status(400).json({
        message:
          "Course, term, section, instructor, day, time, room and seats are required.",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found.",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message:
          "End time must be later than start time.",
      });
    }

    if (Number(seats) < 1) {
      return res.status(400).json({
        message: "Seats must be at least 1.",
      });
    }

    const duplicate = await Offering.findOne({
      courseId,
      term,
      section,
    });

    if (duplicate) {
      return res.status(409).json({
        message:
          "This course section already exists for the selected term.",
      });
    }

    if (addDropOpen && !addDropCloseDate) {
      return res.status(400).json({
        message:
          "Add/drop closing date is required when add/drop is open.",
      });
    }

    const offering = await Offering.create({
      courseId,
      term,
      section,
      instructor,
      day,
      startTime,
      endTime,
      room,
      seats,
      seatsTaken: 0,
      addDropOpen: Boolean(addDropOpen),
      addDropCloseDate:
        addDropOpen
          ? addDropCloseDate
          : null,
    });

    await offering.populate(
      "courseId",
      "code title credits description prerequisites"
    );

    return res.status(201).json({
      message: "Offering created successfully.",
      offering: formatOffering(offering),
    });
  } catch (error) {
    console.error("Create offering error:", error);

    return res.status(500).json({
      message: "Could not create offering.",
    });
  }
};


// ======================================================
// UPDATE OFFERING
// PATCH /api/offerings/:id
// Advisor only
// ======================================================

const updateOffering = async (req, res) => {
  try {
    const offering = await Offering.findById(
      req.params.id
    );

    if (!offering) {
      return res.status(404).json({
        message: "Offering not found.",
      });
    }

    const allowedFields = [
      "section",
      "instructor",
      "day",
      "startTime",
      "endTime",
      "room",
      "seats",
      "addDropOpen",
      "addDropCloseDate",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        offering[field] = req.body[field];
      }
    }

    if (offering.startTime >= offering.endTime) {
      return res.status(400).json({
        message:
          "End time must be later than start time.",
      });
    }

    if (offering.seats < offering.seatsTaken) {
      return res.status(400).json({
        message:
          `Seats cannot be lower than the current ${offering.seatsTaken} registered students.`,
      });
    }

    if (
      offering.addDropOpen &&
      !offering.addDropCloseDate
    ) {
      return res.status(400).json({
        message:
          "Add/drop closing date is required when add/drop is open.",
      });
    }

    if (!offering.addDropOpen) {
      offering.addDropCloseDate = null;
    }

    await offering.save();

    await offering.populate(
      "courseId",
      "code title credits description prerequisites"
    );

    return res.status(200).json({
      message: "Offering updated successfully.",
      offering: formatOffering(offering),
    });
  } catch (error) {
    console.error("Update offering error:", error);

    return res.status(400).json({
      message: "Could not update offering.",
    });
  }
};


// ======================================================
// DELETE OFFERING
// DELETE /api/offerings/:id
// Advisor only
// ======================================================

const deleteOffering = async (req, res) => {
  try {
    const offering = await Offering.findById(
      req.params.id
    );

    if (!offering) {
      return res.status(404).json({
        message: "Offering not found.",
      });
    }

    const registrationCount =
      await Registration.countDocuments({
        offeringId: offering._id,
        status: "registered",
      });

    if (registrationCount > 0) {
      return res.status(409).json({
        message:
          "Cannot remove an offering that has registered students.",
      });
    }

    await offering.deleteOne();

    return res.status(200).json({
      message: "Offering removed successfully.",
    });
  } catch (error) {
    console.error("Delete offering error:", error);

    return res.status(400).json({
      message: "Could not remove offering.",
    });
  }
};


module.exports = {
  getOfferings,
  getOfferingById,
  createOffering,
  updateOffering,
  deleteOffering,
};