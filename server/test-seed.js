const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Course = require("./models/Course");
const Offering = require("./models/Offering");
const Registration = require("./models/Registration");
const Record = require("./models/Record");

const PASSING_GRADES = [
"A",
"B+",
"B",
"C+",
"C",
"D+",
"D"
];

const runTest = async () => {
try {
console.log("=== SEED DATA TEST ===");

await mongoose.connect(
process.env.MONGO_URI
);

console.log("MongoDB connected");

const students =
await User.countDocuments({
role: "student"
});

const advisors =
await User.countDocuments({
role: "advisor"
});

const admins =
await User.countDocuments({
role: "admin"
});

const courses =
await Course.countDocuments({});

const offerings =
await Offering.countDocuments({
term: "2026-1"
});

const records =
await Record.countDocuments({});

console.log(
students === 25
? "PASS - 25 students"
: `FAIL - Students: ${students}`
);

console.log(
advisors === 4
? "PASS - 4 advisors"
: `FAIL - Advisors: ${advisors}`
);

console.log(
admins === 1
? "PASS - 1 admin"
: `FAIL - Admins: ${admins}`
);

console.log(
courses === 18
? "PASS - 18 courses"
: `FAIL - Courses: ${courses}`
);

console.log(
offerings === 26
? "PASS - 26 sections"
: `FAIL - Sections: ${offerings}`
);

console.log(
records === 312
? "PASS - 312 academic records"
: `FAIL - Records: ${records}`
);

// F TEST

const fRecord =
await Record.findOne({
grade: "F"
});

console.log(
fRecord
? "PASS - At least one F exists"
: "FAIL - No F record"
);

// W TEST

const wRecord =
await Record.findOne({
grade: "W"
});

console.log(
wRecord
? "PASS - At least one W exists"
: "FAIL - No W record"
);

// FULL SECTION TEST

const fullSection =
await Offering.findOne({
$expr: {
$gte: [
"$seatsTaken",
"$seats"
]
}
});

console.log(
fullSection
? "PASS - At least one full section exists"
: "FAIL - No full section"
);

// ALREADY PASSED TEST

const currentCourseIds =
await Offering.distinct(
"courseId",
{
term: "2026-1"
}
);

const passed =
await Record.findOne({
courseId: {
$in: currentCourseIds
},
grade: {
$in: PASSING_GRADES
}
});

console.log(
passed
? "PASS - Already-passed case exists"
: "FAIL - No already-passed case"
);

// TIME CLASH TEST

const registrations =
await Registration.find({
term: "2026-1",
status: "registered"
})
.populate({
path: "offeringId",
populate: {
path: "courseId"
}
});

const currentOfferings =
await Offering.find({
term: "2026-1"
})
.populate("courseId");

let clashFound = false;

for (const registration of registrations) {
const registered =
registration.offeringId;

if (!registered) {
continue;
}

for (const candidate of currentOfferings) {
if (
candidate._id.toString() ===
registered._id.toString()
) {
continue;
}

if (
candidate.day !==
registered.day
) {
continue;
}

const overlap =
candidate.startTime <
registered.endTime &&
candidate.endTime >
registered.startTime;

if (overlap) {
console.log(
`PASS - Time clash exists: ${registered.courseId.code} ${registered.section} clashes with ${candidate.courseId.code} ${candidate.section}`
);

clashFound = true;
break;
}
}

if (clashFound) {
break;
}
}

if (!clashFound) {
console.log(
"FAIL - No time-clash case"
);
}

console.log(
"=== SEED TEST COMPLETE ==="
);

} catch (error) {
console.log("TEST ERROR");
console.log(error.message);
} finally {
await mongoose.disconnect();
console.log("MongoDB disconnected");
}
};

runTest();q