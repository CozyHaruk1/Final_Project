const Notification = require("../models/Notification");
const Registration = require("../models/Registration");

const notifyAddDropChange = async (offering, previousAddDropOpen) => {
  if (previousAddDropOpen === offering.addDropOpen) {
    return;
  }

  try {
    const affected = await Registration.find({
      offeringId: offering._id,
      status: "registered",
    });

    const courseCode = offering.courseId?.code || "Course";

    const message = offering.addDropOpen
      ? `Add/Drop is now open for ${courseCode} Section ${offering.section} until ${new Date(
          offering.addDropCloseDate
        ).toLocaleDateString()}.`
      : `Add/Drop has closed for ${courseCode} Section ${offering.section}.`;

    for (const reg of affected) {
      await Notification.create({
        userId: reg.studentId,
        type: offering.addDropOpen ? "adddrop_opened" : "adddrop_closed",
        message,
        read: false,
      });
    }
  } catch (error) {
    console.error("Add/Drop notification error:", error);
  }
};

module.exports = { notifyAddDropChange };
