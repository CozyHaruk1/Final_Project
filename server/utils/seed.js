const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../config/db");

const User = require("../models/User");
const Course = require("../models/Course");
const Offering = require("../models/Offering");
const Registration = require("../models/Registration");
const Record = require("../models/Record");


// ======================================================
// CLEAR DATABASE
// ======================================================

const clearDatabase = async () => {
  console.log("Clearing old seed data...");

  await Registration.deleteMany({});
  await Record.deleteMany({});
  await Offering.deleteMany({});
  await Course.deleteMany({});
  await User.deleteMany({});

  console.log("Old data cleared");
};


// ======================================================
// USERS
// ======================================================

const seedUsers = async () => {
  console.log("Creating users...");

  const passwordHash = await bcrypt.hash(
    "Password123!",
    10
  );

  const admin = await User.create({
    name: "Demo Admin",
    email: "admin@university.test",
    passwordHash,
    role: "admin",
    active: true,
  });

  const advisors = await User.insertMany([
    {
      name: "Advisor Alpha",
      email: "advisor1@university.test",
      passwordHash,
      role: "advisor",
      active: true,
    },
    {
      name: "Advisor Beta",
      email: "advisor2@university.test",
      passwordHash,
      role: "advisor",
      active: true,
    },
    {
      name: "Advisor Gamma",
      email: "advisor3@university.test",
      passwordHash,
      role: "advisor",
      active: true,
    },
    {
      name: "Advisor Delta",
      email: "advisor4@university.test",
      passwordHash,
      role: "advisor",
      active: true,
    },
  ]);

  const studentNames = [
    "Ari Chen",
    "Mina Park",
    "Leo Tan",
    "Nora Lim",
    "Evan Lee",
    "Jade Wong",
    "Noah Kim",
    "Lina Chen",
    "Ryan Park",
    "Maya Tan",
    "Eli Wong",
    "Sora Lee",
    "Adam Lim",
    "Nina Kim",
    "Kai Chen",
    "Luna Park",
    "Eric Tan",
    "Zoe Lee",
    "Ian Wong",
    "Mira Lim",
    "Alex Kim",
    "Sena Chen",
    "Jay Park",
    "Emma Tan",
    "Luke Lee",
  ];

  const studentData = studentNames.map(
    (name, index) => ({
      name,

      email:
        `student${index + 1}@university.test`,

      passwordHash,

      role: "student",

      studentId:
        `STU${String(index + 1).padStart(
          3,
          "0"
        )}`,

      advisorId:
        advisors[
          index % advisors.length
        ]._id,

      active: true,
    })
  );

  const students =
    await User.insertMany(studentData);

  console.log(
    "25 students, 4 advisors, 1 admin created"
  );

  return {
    admin,
    advisors,
    students,
  };
};


// ======================================================
// COURSES
// ======================================================

const seedCourses = async () => {
  console.log("Creating courses...");

  const courseData = [
    {
      code: "CSC220",
      title: "Web Development II",
      credits: 4,
      description:
        "Full-stack web application development.",
      prerequisites: [],
    },
    {
      code: "CSC310",
      title: "Advanced Web Development",
      credits: 4,
      description:
        "Advanced client and server web development.",
      prerequisites: ["CSC220"],
    },
    {
      code: "CSC320",
      title: "Database Management",
      credits: 4,
      description:
        "Database design and database management.",
      prerequisites: [],
    },
    {
      code: "CSC330",
      title: "Software Engineering",
      credits: 4,
      description:
        "Software engineering principles and practices.",
      prerequisites: [],
    },
    {
      code: "CSC340",
      title:
        "Data Structures and Algorithms",
      credits: 4,
      description:
        "Core data structures and algorithm design.",
      prerequisites: [],
    },
    {
      code: "CSC350",
      title:
        "Mobile Application Development",
      credits: 4,
      description:
        "Development of mobile applications.",
      prerequisites: ["CSC220"],
    },
    {
      code: "ITE310",
      title: "IT Project Management",
      credits: 4,
      description:
        "Planning and management of IT projects.",
      prerequisites: [],
    },
    {
      code: "ITE321",
      title:
        "Systems Analysis, Design & Implementation",
      credits: 4,
      description:
        "Analysis and design of information systems.",
      prerequisites: [],
    },
    {
      code: "ITE330",
      title:
        "Web Systems and Technologies",
      credits: 4,
      description:
        "Web systems and modern web technologies.",
      prerequisites: ["CSC220"],
    },
    {
      code: "ITE340",
      title: "Cloud Computing",
      credits: 4,
      description:
        "Cloud platforms, services and infrastructure.",
      prerequisites: [],
    },
    {
      code: "ITE350",
      title:
        "Human Computer Interaction",
      credits: 4,
      description:
        "User-centered interface and interaction design.",
      prerequisites: [],
    },
    {
      code: "ITE360",
      title: "IT Infrastructure",
      credits: 4,
      description:
        "Enterprise computing and IT infrastructure.",
      prerequisites: [],
    },
    {
      code: "ITE370",
      title: "Network Administration",
      credits: 4,
      description:
        "Administration and management of computer networks.",
      prerequisites: [],
    },
    {
      code: "ITE380",
      title: "Information Systems",
      credits: 4,
      description:
        "Information systems concepts and applications.",
      prerequisites: [],
    },
    {
      code: "ITE410",
      title:
        "Cybersecurity Fundamentals",
      credits: 4,
      description:
        "Fundamental cybersecurity principles.",
      prerequisites: [],
    },
    {
      code: "ITE420",
      title: "Information Security",
      credits: 4,
      description:
        "Information assurance and security controls.",
      prerequisites: [],
    },
    {
      code: "ITE430",
      title: "IT Governance",
      credits: 4,
      description:
        "Governance and management of information technology.",
      prerequisites: [],
    },
    {
      code: "ITE440",
      title:
        "Information Security Management",
      credits: 4,
      description:
        "Management of organizational information security.",
      prerequisites: ["ITE420"],
    },
  ];

  const courses =
    await Course.insertMany(courseData);

  console.log("18 courses created");

  return courses;
};


// ======================================================
// OFFERINGS
// ======================================================

const seedOfferings = async (courses) => {
  console.log(
    "Creating course offerings..."
  );

  const courseMap = new Map();

  courses.forEach((course) => {
    courseMap.set(
      course.code,
      course._id
    );
  });

  const getCourseId = (code) => {
    const courseId =
      courseMap.get(code);

    if (!courseId) {
      throw new Error(
        `Course not found: ${code}`
      );
    }

    return courseId;
  };

  const offeringsData = [
    {
      courseId: getCourseId("CSC220"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Smith",
      day: "Monday",
      startTime: "09:00",
      endTime: "11:00",
      room: "A301",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: true,
      addDropCloseDate:
        new Date("2026-10-01"),
    },
    {
      courseId: getCourseId("CSC220"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Johnson",
      day: "Wednesday",
      startTime: "13:00",
      endTime: "15:00",
      room: "A302",
      seats: 6,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC310"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Williams",
      day: "Tuesday",
      startTime: "09:00",
      endTime: "11:00",
      room: "A303",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC320"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Brown",
      day: "Monday",
      startTime: "13:00",
      endTime: "15:00",
      room: "B201",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC320"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Davis",
      day: "Thursday",
      startTime: "09:00",
      endTime: "11:00",
      room: "B202",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC330"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Miller",
      day: "Tuesday",
      startTime: "13:00",
      endTime: "15:00",
      room: "B203",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC340"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Wilson",
      day: "Wednesday",
      startTime: "09:00",
      endTime: "11:00",
      room: "C301",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC350"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Moore",
      day: "Thursday",
      startTime: "13:00",
      endTime: "15:00",
      room: "C302",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE310"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Taylor",
      day: "Monday",
      startTime: "15:00",
      endTime: "17:00",
      room: "C303",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE321"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Anderson",
      day: "Tuesday",
      startTime: "09:00",
      endTime: "11:00",
      room: "D201",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: true,
      addDropCloseDate:
        new Date("2026-10-02"),
    },
    {
      courseId: getCourseId("ITE321"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Thomas",
      day: "Friday",
      startTime: "09:00",
      endTime: "11:00",
      room: "D202",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE330"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Jackson",
      day: "Wednesday",
      startTime: "13:00",
      endTime: "15:00",
      room: "D203",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE340"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. White",
      day: "Monday",
      startTime: "09:00",
      endTime: "11:00",
      room: "E301",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE350"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Harris",
      day: "Tuesday",
      startTime: "15:00",
      endTime: "17:00",
      room: "E302",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE360"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Martin",
      day: "Wednesday",
      startTime: "09:00",
      endTime: "11:00",
      room: "E303",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE370"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Thompson",
      day: "Thursday",
      startTime: "09:00",
      endTime: "11:00",
      room: "F201",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: true,
      addDropCloseDate:
        new Date("2026-10-01"),
    },
    {
      courseId: getCourseId("ITE380"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Garcia",
      day: "Friday",
      startTime: "13:00",
      endTime: "15:00",
      room: "F202",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: true,
      addDropCloseDate:
        new Date("2026-10-01"),
    },
    {
      courseId: getCourseId("ITE410"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Martinez",
      day: "Monday",
      startTime: "13:00",
      endTime: "15:00",
      room: "F203",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE420"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Robinson",
      day: "Friday",
      startTime: "13:00",
      endTime: "15:00",
      room: "G301",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE420"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Clark",
      day: "Thursday",
      startTime: "15:00",
      endTime: "17:00",
      room: "G302",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE430"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Rodriguez",
      day: "Wednesday",
      startTime: "15:00",
      endTime: "17:00",
      room: "G303",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE440"),
      term: "2026-1",
      section: "A",
      instructor: "Dr. Lewis",
      day: "Friday",
      startTime: "09:00",
      endTime: "11:00",
      room: "H201",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC330"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Lee",
      day: "Thursday",
      startTime: "13:00",
      endTime: "15:00",
      room: "H202",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("CSC340"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Walker",
      day: "Friday",
      startTime: "13:00",
      endTime: "15:00",
      room: "H203",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE350"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Hall",
      day: "Monday",
      startTime: "11:00",
      endTime: "13:00",
      room: "I201",
      seats: 40,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
    {
      courseId: getCourseId("ITE410"),
      term: "2026-1",
      section: "B",
      instructor: "Dr. Allen",
      day: "Wednesday",
      startTime: "11:00",
      endTime: "13:00",
      room: "I202",
      seats: 35,
      seatsTaken: 0,
      addDropOpen: false,
      addDropCloseDate: null,
    },
  ];

  const offerings =
    await Offering.insertMany(
      offeringsData
    );

  console.log(
    "26 sections created for term 2026-1"
  );

  return offerings;
};


// ======================================================
// ACADEMIC RECORDS
// ======================================================

const seedRecords = async (
  students,
  courses
) => {
  console.log(
    "Creating academic records..."
  );

  const records = [];

  const terms = [
    "2024-1",
    "2024-2",
    "2025-1",
    "2025-2",
  ];

  const gradePool = [
    "A",
    "B+",
    "B",
    "C+",
    "C",
    "D+",
    "D",
    "B",
    "C+",
    "B+",
    "C",
    "D",
    "W",
  ];

  for (
    let studentIndex = 0;
    studentIndex < students.length;
    studentIndex++
  ) {
    const recordCount =
      studentIndex < 12
        ? 13
        : 12;

    for (
      let recordIndex = 0;
      recordIndex < recordCount;
      recordIndex++
    ) {
      const courseIndex =
        (
          studentIndex * 3 +
          recordIndex
        ) %
        courses.length;

      const course =
        courses[courseIndex];

      let grade =
        gradePool[
          (
            studentIndex * 5 +
            recordIndex
          ) %
            gradePool.length
        ];

      /*
        Student 1 gets an F in ITE370.
        Used to test Retake Required.
      */
      if (
        studentIndex === 0 &&
        course.code === "ITE370"
      ) {
        grade = "F";
      }

      records.push({
        studentId:
          students[
            studentIndex
          ]._id,

        courseId:
          course._id,

        term:
          terms[
            recordIndex %
              terms.length
          ],

        grade,
      });
    }
  }

  if (records.length !== 312) {
    throw new Error(
      `Expected 312 academic records but created ${records.length}`
    );
  }

  await Record.insertMany(records);

  console.log(
    "312 completed-course records created"
  );

  return records;
};


// ======================================================
// CURRENT REGISTRATIONS
// ======================================================

const seedRegistrations = async (
  students,
  courses,
  offerings
) => {
  console.log(
    "Creating current registrations..."
  );

  const courseMap = new Map();

  courses.forEach((course) => {
    courseMap.set(
      course.code,
      course._id.toString()
    );
  });

  const getOffering = (
    courseCode,
    section
  ) => {
    const courseId =
      courseMap.get(courseCode);

    const offering =
      offerings.find((item) => {
        return (
          item.courseId.toString() ===
            courseId &&
          item.section === section
        );
      });

    if (!offering) {
      throw new Error(
        `Offering not found: ${courseCode} section ${section}`
      );
    }

    return offering;
  };


  const csc220B =
    getOffering(
      "CSC220",
      "B"
    );

  const ite380A =
    getOffering(
      "ITE380",
      "A"
    );


  const registrationsData = [
    {
      studentId:
        students[0]._id,

      offeringId:
        ite380A._id,

      term: "2026-1",

      status:
        "registered",
    },
    {
      studentId:
        students[1]._id,

      offeringId:
        csc220B._id,

      term: "2026-1",

      status:
        "registered",
    },
    {
      studentId:
        students[7]._id,

      offeringId:
        csc220B._id,

      term: "2026-1",

      status:
        "registered",
    },
    {
      studentId:
        students[13]._id,

      offeringId:
        csc220B._id,

      term: "2026-1",

      status:
        "registered",
    },
    {
      studentId:
        students[14]._id,

      offeringId:
        csc220B._id,

      term: "2026-1",

      status:
        "registered",
    },
    {
      studentId:
        students[19]._id,

      offeringId:
        csc220B._id,

      term: "2026-1",

      status:
        "registered",
    },
    {
      studentId:
        students[20]._id,

      offeringId:
        csc220B._id,

      term: "2026-1",

      status:
        "registered",
    },
  ];

  const registrations =
    await Registration.insertMany(
      registrationsData
    );


  /*
    Reset all seatsTaken values.
  */

  await Offering.updateMany(
    {},
    {
      $set: {
        seatsTaken: 0,
      },
    }
  );


  /*
    Count active registrations
    per offering.
  */

  const seatCounts =
    await Registration.aggregate([
      {
        $match: {
          status:
            "registered",
        },
      },
      {
        $group: {
          _id:
            "$offeringId",

          count: {
            $sum: 1,
          },
        },
      },
    ]);


  for (
    const seatCount of seatCounts
  ) {
    await Offering.findByIdAndUpdate(
      seatCount._id,
      {
        $set: {
          seatsTaken:
            seatCount.count,
        },
      }
    );
  }


  console.log(
    `${registrations.length} current registrations created`
  );

  return registrations;
};


// ======================================================
// VERIFY DATA
// ======================================================

const verifySeed = async () => {
  console.log(
    "Verifying seed data..."
  );

  const studentCount =
    await User.countDocuments({
      role: "student",
    });

  const advisorCount =
    await User.countDocuments({
      role: "advisor",
    });

  const adminCount =
    await User.countDocuments({
      role: "admin",
    });

  const courseCount =
    await Course.countDocuments({});

  const offeringCount =
    await Offering.countDocuments({
      term: "2026-1",
    });

  const recordCount =
    await Record.countDocuments({});

  const failedRecord =
    await Record.findOne({
      grade: "F",
    });

  const fullOffering =
    await Offering.findOne({
      $expr: {
        $eq: [
          "$seats",
          "$seatsTaken",
        ],
      },
    });


  if (studentCount !== 25) {
    throw new Error(
      `Expected 25 students, found ${studentCount}`
    );
  }

  if (advisorCount !== 4) {
    throw new Error(
      `Expected 4 advisors, found ${advisorCount}`
    );
  }

  if (adminCount !== 1) {
    throw new Error(
      `Expected 1 admin, found ${adminCount}`
    );
  }

  if (courseCount !== 18) {
    throw new Error(
      `Expected 18 courses, found ${courseCount}`
    );
  }

  if (offeringCount !== 26) {
    throw new Error(
      `Expected 26 offerings, found ${offeringCount}`
    );
  }

  if (recordCount !== 312) {
    throw new Error(
      `Expected 312 records, found ${recordCount}`
    );
  }

  if (!failedRecord) {
    throw new Error(
      "No F grade found in academic records"
    );
  }

  if (!fullOffering) {
    throw new Error(
      "No full course offering found"
    );
  }


  console.log(
    "Seed verification passed"
  );
};


// ======================================================
// RUN SEED
// ======================================================

const seed = async () => {
  try {
    await connectDB();

    await clearDatabase();


    const {
      advisors,
      students,
    } = await seedUsers();


    const courses =
      await seedCourses();


    const offerings =
      await seedOfferings(
        courses
      );


    await seedRecords(
      students,
      courses
    );


    await seedRegistrations(
      students,
      courses,
      offerings
    );


    await verifySeed();


    console.log("");

    console.log(
      "Seeding complete!"
    );

    console.log(
      "25 students, 4 advisors, 1 admin created"
    );

    console.log(
      "18 courses, 26 sections created for term 2026-1"
    );

    console.log(
      "312 completed-course records created"
    );


    console.log("");

    console.log(
      "Test login accounts:"
    );

    console.log(
      "Admin: admin@university.test / Password123!"
    );

    console.log(
      "Advisor: advisor1@university.test / Password123!"
    );

    console.log(
      "Student: student1@university.test / Password123!"
    );

  } catch (error) {
    console.error("");

    console.error(
      "Seeding failed:"
    );

    console.error(
      error.message
    );

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected"
    );
  }
};


seed();