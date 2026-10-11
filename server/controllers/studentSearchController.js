const User = require("../models/User");
const Registration = require("../models/Registration");

const CURRENT_TERM = "2026-1";

const searchStudents = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: "student" };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { studentId: regex },
      ];
    }

    const students = await User.find(filter)
      .select("name email studentId active")
      .sort({ name: 1 });

    return res.status(200).json(students);
  } catch (error) {
    console.error("Search students error:", error);
    return res.status(500).json({
      message: "Could not search students.",
    });
  }
};

const getStudentRegistrations = async (req, res) => {
  try {
    const studentId = req.params.id;
    const term = req.query.term || CURRENT_TERM;

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    }).select("name email studentId");

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const registrations = await Registration.find({
      studentId: student._id,
      term,
      status: "registered",
    }).populate({
      path: "offeringId",
      populate: { path: "courseId", select: "code title credits" },
    });

    const formatted = registrations
      .filter((r) => r.offeringId)
      .map((r) => {
        const offering = r.offeringId.toObject();
        return {
          id: r._id,
          status: r.status,
          term: r.term,
          offering: {
            ...offering,
            seatsRemaining: Math.max(0, offering.seats - offering.seatsTaken),
          },
        };
      });

    return res.status(200).json({ student, term, registrations: formatted });
  } catch (error) {
    console.error("Get student registrations error:", error);
    return res.status(500).json({
      message: "Could not retrieve registrations.",
    });
  }
};

module.exports = {
  searchStudents,
  getStudentRegistrations,
};
