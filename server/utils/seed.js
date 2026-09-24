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
    "Moses D. Johnson", //Student1
    "George V. Bushmask", //Student2
    "Haruki Murasaki", //Student3
    "Bruce Wayne", //Student4
    "Victor Von Doom", //Student5
    "Thor Odinson", //Student6
    "Jeff D. Vinsmoke", //Student7
    "Ian McDornald", //Student8
    "Tony Stark", //Student9
    "Sephiroth", //Student10
    "Lily Hosein", //Student11
    "Wu Shin Yao", //Student12
    "Zhu Bajie", //Student13
    "Mono Von Bismarck", //Student14
    "Kanji Noda", //Student15
    "Eichiro Oda", //Student16
    "Sugita Tomokazu", //Student17
    "Nouto Mamiko", //Student18
    "Hatsume Miku", //Student19
    "Shiranui Mai", //Student20
    "Makima", //Student21
    "Tanjiro Kamado", //Student22
    "Michikatsu Tsugikuni", //Student23
    "Muzan Kibutsuji", //Student24
    "Samual D. Scotch", //Student25
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
    code: "CSC101",
    title: "Introduction to Computing and Intelligence Systems",
    credits: 4,
    description:
      "Introduction to computing concepts and intelligent systems.",
    prerequisites: [],
  },
  {
    code: "CSC103",
    title: "Introduction to Data Structures and Algorithms Analysis",
    credits: 4,
    description:
      "Introduction to data structures, algorithms and analysis.",
    prerequisites: [],
  },
  {
    code: "CSC104",
    title: "Computer Organization",
    credits: 4,
    description:
      "Fundamentals of computer architecture and organization.",
    prerequisites: [],
  },
  {
    code: "CSC210",
    title:
      "Ethics and Professional Issues in Computing and Intelligence Systems",
    credits: 4,
    description:
      "Professional, ethical and social issues in computing.",
    prerequisites: [],
  },
  {
    code: "CSC321",
    title:
      "System Analysis, Design, and Implementation",
    credits: 4,
    description:
      "Analysis, design and implementation of information systems.",
    prerequisites: [],
  },
  {
    code: "CSC254",
    title: "Human Computer Interaction",
    credits: 4,
    description:
      "Principles of usability and human-computer interaction.",
    prerequisites: [],
  },
  {
    code: "CSC120",
    title: "Web Development I",
    credits: 4,
    description:
      "Introduction to modern web development.",
    prerequisites: ["CSC254", "ITE221"],
  },
  {
    code: "ITE221",
    title: "IT Programming I",
    credits: 4,
    description:
      "Fundamental programming concepts and problem solving.",
    prerequisites: ["CSC103"],
  },
  {
    code: "ITE222",
    title: "IT Programming II",
    credits: 4,
    description:
      "Object-oriented and intermediate programming concepts.",
    prerequisites: ["ITE221"],
  },
  {
    code: "ITE233",
    title: "Introduction to Internet of Things",
    credits: 4,
    description:
      "Introduction to Internet of Things technologies and applications.",
    prerequisites: ["ITE221"],
  },
  {
    code: "ITE475",
    title: "Network I",
    credits: 4,
    description:
      "Fundamentals of computer networking.",
    prerequisites: [],
  },
  {
    code: "ITE441",
    title: "Database Management Systems I",
    credits: 4,
    description:
      "Relational database design, SQL and database management.",
    prerequisites: [],
  },
  {
    code: "ITE442",
    title: "Database Management Systems II",
    credits: 4,
    description:
      "Advanced database development and management.",
    prerequisites: ["ITE441"],
  },
  {
    code: "ITE240",
    title: "Operating Systems",
    credits: 4,
    description:
      "Operating system concepts, processes, memory and storage.",
    prerequisites: [],
  },
  {
    code: "ITE231",
    title: "System Administration and Maintenance",
    credits: 4,
    description:
      "Administration and maintenance of computer systems.",
    prerequisites: [],
  },
  {
    code: "ITE420",
    title: "Information Assurance and Security I",
    credits: 4,
    description:
      "Information assurance, cybersecurity controls and security practices.",
    prerequisites: ["ITE475"],
  },
  {
    code: "ITE220",
    title: "Web Development II",
    credits: 4,
    description:
      "Advanced client-side and server-side web application development.",
    prerequisites: ["ITE222"],
  },
  {
    code: "ITE343",
    title: "Mobile Application Development",
    credits: 4,
    description:
      "Design and implementation of mobile applications.",
    prerequisites: ["ITE222"],
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

  // ======================================================
  // CREATE COURSE MAP
  // ======================================================

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

  // ======================================================
  // OFFERING DATA
  // ======================================================

  const offeringSpecs = [
    // ------------------------------------------------------
    // CSC BASIC / CORE COURSES
    // ------------------------------------------------------

    [
      "CSC101",
      "A",
      "Dr. Lockheart",
      "Monday",
      "08:30",
      "10:30",
      "A301",
      30,
      true,
    ],

    [
      "CSC101",
      "B",
      "Dr. Hsin",
      "Wednesday",
      "13:00",
      "15:00",
      "A302",
      30,
      false,
    ],

    [
      "CSC103",
      "A",
      "Dr. Motonuii",
      "Tuesday",
      "08:30",
      "10:30",
      "A303",
      30,
      false,
    ],

    [
      "CSC104",
      "A",
      "Dr. Parker",
      "Wednesday",
      "10:30",
      "12:30",
      "B201",
      30,
      false,
    ],

    [
      "CSC210",
      "A",
      "Dr. Koro",
      "Thursday",
      "08:30",
      "10:30",
      "B202",
      30,
      false,
    ],

    [
      "CSC321",
      "A",
      "Dr. Sung",
      "Monday",
      "13:00",
      "15:00",
      "B203",
      30,
      true,
    ],

    [
      "CSC321",
      "B",
      "Dr. MonoVan",
      "Thursday",
      "13:00",
      "15:00",
      "C301",
      30,
      false,
    ],

    [
      "CSC254",
      "A",
      "Dr. Richard",
      "Tuesday",
      "10:30",
      "12:30",
      "C302",
      30,
      false,
    ],

    // ------------------------------------------------------
    // ITE PROGRAMMING
    // ------------------------------------------------------

    [
      "ITE221",
      "A",
      "Dr. Bahubali",
      "Wednesday",
      "08:30",
      "10:30",
      "C303",
      30,
      true,
    ],

    [
      "ITE221",
      "B",
      "Dr. GainsBorough",
      "Friday",
      "13:00",
      "15:00",
      "D201",
      30,
      false,
    ],

    [
      "ITE222",
      "A",
      "Dr. Shimura",
      "Thursday",
      "10:30",
      "12:30",
      "D202",
      30,
      false,
    ],

    [
      "ITE222",
      "B",
      "Dr. Yagi",
      "Monday",
      "15:00",
      "17:00",
      "D203",
      30,
      true,
    ],

    // ------------------------------------------------------
    // WEB DEVELOPMENT
    // ------------------------------------------------------

    [
      "CSC120",
      "A",
      "Dr. Bate",
      "Tuesday",
      "13:00",
      "15:00",
      "E301",
      30,
      false,
    ],

    [
      "CSC120",
      "B",
      "Dr. Midoriya",
      "Friday",
      "08:30",
      "10:30",
      "E302",
      30,
      false,
    ],

    // ------------------------------------------------------
    // IOT / NETWORK
    // ------------------------------------------------------

    [
      "ITE233",
      "A",
      "Dr. Jordan",
      "Wednesday",
      "15:00",
      "17:00",
      "E303",
      30,
      false,
    ],

    [
      "ITE475",
      "A",
      "Dr. Xebec",
      "Monday",
      "10:30",
      "12:30",
      "F201",
      30,
      true,
    ],

    [
      "ITE475",
      "B",
      "Dr. Duolingo",
      "Thursday",
      "15:00",
      "17:00",
      "F202",
      30,
      false,
    ],

    // ------------------------------------------------------
    // DATABASE
    // ------------------------------------------------------

    [
      "ITE441",
      "A",
      "Dr. Jobs",
      "Tuesday",
      "15:00",
      "17:00",
      "F203",
      30,
      true,
    ],

    [
      "ITE441",
      "B",
      "Dr. Rin",
      "Friday",
      "10:30",
      "12:30",
      "G301",
      30,
      false,
    ],

    [
      "ITE442",
      "A",
      "Dr. Ather",
      "Wednesday",
      "13:00",
      "15:00",
      "G302",
      30,
      false,
    ],

    // ------------------------------------------------------
    // OPERATING SYSTEMS
    // Small class used for FULL section testing
    // ------------------------------------------------------

    [
      "ITE240",
      "A",
      "Dr. Swift",
      "Thursday",
      "13:00",
      "15:00",
      "LAB1",
      6,
      true,
    ],

    // ------------------------------------------------------
    // SYSTEM ADMINISTRATION
    // ------------------------------------------------------

    [
      "ITE231",
      "A",
      "Dr. Scott",
      "Friday",
      "15:00",
      "17:00",
      "G303",
      30,
      false,
    ],

    // ------------------------------------------------------
    // INFORMATION SECURITY
    // ------------------------------------------------------

    [
      "ITE420",
      "A",
      "Dr. Wake",
      "Monday",
      "13:00",
      "15:00",
      "H201",
      30,
      true,
    ],

    [
      "ITE420",
      "B",
      "Dr. Banner",
      "Wednesday",
      "10:30",
      "12:30",
      "H202",
      30,
      false,
    ],

    // ------------------------------------------------------
    // WEB DEVELOPMENT II
    // ------------------------------------------------------

    [
      "ITE220",
      "A",
      "Dr. Dawson",
      "Tuesday",
      "13:00",
      "15:00",
      "H203",
      30,
      true,
    ],

    // ------------------------------------------------------
    // MOBILE APPLICATION DEVELOPMENT
    // ------------------------------------------------------

    [
      "ITE343",
      "A",
      "Dr. Shimura",
      "Friday",
      "13:00",
      "15:00",
      "I201",
      30,
      false,
    ],
  ];

  // ======================================================
  // CONVERT SPECS INTO OFFERING OBJECTS
  // ======================================================

  const offeringsData =
    offeringSpecs.map(
      ([
        code,
        section,
        instructor,
        day,
        startTime,
        endTime,
        room,
        seats,
        addDropOpen,
      ]) => ({
        courseId:
          getCourseId(code),

        term:
          "2026-1",

        section,

        instructor,

        day,

        startTime,

        endTime,

        room,

        seats,

        seatsTaken: 0,

        addDropOpen,

        addDropCloseDate:
          addDropOpen
            ? new Date(
                "2026-10-02"
              )
            : null,
      })
    );

  // ======================================================
  // VERIFY EXACT NUMBER OF SECTIONS
  // ======================================================

  if (
    offeringsData.length !== 26
  ) {
    throw new Error(
      `Expected 26 offerings but created ${offeringsData.length}`
    );
  }

  // ======================================================
  // INSERT OFFERINGS
  // ======================================================

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

  const terms = [
    "2024-1",
    "2024-2",
    "2025-1",
    "2025-2",
  ];

  const records = [];

  /*
    Different performance levels so students
    do not all have nearly identical GPAs.
  */
  const basePoints = [
    3.8,
    3.6,
    3.4,
    3.2,
    3.0,
    2.8,
    2.6,
    2.4,
    2.2,
    2.0,
    1.8,
    3.7,
    3.5,
    3.3,
    3.1,
    2.9,
    2.7,
    2.5,
    2.3,
    2.1,
    1.9,
    3.55,
    3.25,
    2.75,
    2.45,
  ];

  const variation = [
    0,
    0.5,
    -0.5,
    0,
    0.5,
    -0.5,
    0,
    0,
    0.5,
    -0.5,
    0,
    0.5,
    -0.5,
  ];

  const gradeScale = [
    { grade: "A", points: 4.0 },
    { grade: "B+", points: 3.5 },
    { grade: "B", points: 3.0 },
    { grade: "C+", points: 2.5 },
    { grade: "C", points: 2.0 },
    { grade: "D+", points: 1.5 },
    { grade: "D", points: 1.0 },
  ];

  const gradeFromPoints = (points) => {
  const safePoints = Math.max(
    1,
    Math.min(4, points)
  );

  let best = gradeScale[0];

  for (const item of gradeScale) {
    const currentDifference =
      Math.abs(
        item.points - safePoints
      );

    const bestDifference =
      Math.abs(
        best.points - safePoints
      );

    if (
      currentDifference <
        bestDifference ||
      (
        currentDifference ===
          bestDifference &&
        item.points > best.points
      )
    ) {
      best = item;
    }
  }

  return best.grade;
};


// ======================================================
// DIFFERENT ACADEMIC HISTORY LENGTHS
// ======================================================

/*
  Total = exactly 312 records.

  Students now have between
  9 and 15 completed-course records.

  This creates more variety in
  credits and academic progress.

  9 courses  = about 36 credits
  12 courses = about 48 credits
  15 courses = about 60 credits

  F and W grades can reduce the
  actual earned-credit amount.
*/

const recordCounts = [
  9,   // STU001
  9,   // STU002

  10,  // STU003
  10,  // STU004
  10,  // STU005

  11,  // STU006
  11,  // STU007
  11,  // STU008

  12,  // STU009
  12,  // STU010
  12,  // STU011
  12,  // STU012

  13,  // STU013
  13,  // STU014
  13,  // STU015
  13,  // STU016

  14,  // STU017
  14,  // STU018
  14,  // STU019
  14,  // STU020

  15,  // STU021
  15,  // STU022
  15,  // STU023
  15,  // STU024
  15,  // STU025
];


// ======================================================
// VERIFY RECORD DISTRIBUTION
// ======================================================

const expectedTotal =
  recordCounts.reduce(
    (total, count) =>
      total + count,
    0
  );

if (
  recordCounts.length !==
  students.length
) {
  throw new Error(
    "Record count configuration does not match the number of students"
  );
}

if (expectedTotal !== 312) {
  throw new Error(
    `Record distribution must total 312, found ${expectedTotal}`
  );
}


// ======================================================
// CREATE STUDENT RECORDS
// ======================================================

for (
  let studentIndex = 0;
  studentIndex < students.length;
  studentIndex++
) {
  const recordCount =
    recordCounts[
      studentIndex
    ];

  const selectedCourses = [];

  // ----------------------------------------------------
  // SELECT COURSES
  // ----------------------------------------------------

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

    selectedCourses.push(
      courses[courseIndex]
    );
  }


  // ====================================================
  // ENSURE SPECIAL COURSES EXIST
  // ====================================================

  const ensureCourse = (code) => {
    const alreadyIncluded =
      selectedCourses.some(
        (course) =>
          course.code === code
      );

    if (alreadyIncluded) {
      return;
    }

    const course =
      courses.find(
        (item) =>
          item.code === code
      );

    if (!course) {
      throw new Error(
        `Required seed course not found: ${code}`
      );
    }

    /*
      Replace the final selected
      course instead of adding one.

      This keeps the student's
      record count unchanged.
    */
    selectedCourses[
      selectedCourses.length - 1
    ] = course;
  };


  // ====================================================
  // SPECIAL ACADEMIC CASES
  // ====================================================

  /*
    STU001
    Failed Network I.

    This gives us a clear
    Retake Required demo.
  */
  if (studentIndex === 0) {
    ensureCourse("ITE475");
  }

  /*
    STU006
    Failed Programming I.
  */
  if (studentIndex === 5) {
    ensureCourse("ITE221");
  }

  /*
    STU011
    Failed Database Management II.
  */
  if (studentIndex === 10) {
    ensureCourse("ITE442");
  }

  /*
    STU004
    Withdrew from Programming II.
  */
  if (studentIndex === 3) {
    ensureCourse("ITE222");
  }

  /*
    STU018
    Withdrew from Web Development II.
  */
  if (studentIndex === 17) {
    ensureCourse("ITE220");
  }


  // ====================================================
  // ASSIGN GRADES + TERMS
  // ====================================================

  for (
    let recordIndex = 0;
    recordIndex <
      selectedCourses.length;
    recordIndex++
  ) {
    const course =
      selectedCourses[
        recordIndex
      ];

    /*
      Normal grade based on the
      student's academic level.
    */
    let grade =
      gradeFromPoints(
        basePoints[
          studentIndex
        ] +
        variation[
          (
            recordIndex +
            studentIndex
          ) %
            variation.length
        ]
      );


    // ==================================================
    // F GRADES
    // ==================================================

    if (
      studentIndex === 0 &&
      course.code === "ITE475"
    ) {
      grade = "F";
    }

    if (
      studentIndex === 5 &&
      course.code === "ITE221"
    ) {
      grade = "F";
    }

    if (
      studentIndex === 10 &&
      course.code === "ITE442"
    ) {
      grade = "F";
    }


    // ==================================================
    // WITHDRAWALS
    // ==================================================

    if (
      studentIndex === 3 &&
      course.code === "ITE222"
    ) {
      grade = "W";
    }

    if (
      studentIndex === 17 &&
      course.code === "ITE220"
    ) {
      grade = "W";
    }


    // ==================================================
    // TERM DISTRIBUTION
    // ==================================================

    /*
      Up to four completed courses
      per historical term.

      Example with 15 courses:

      2024-1 = 4
      2024-2 = 4
      2025-1 = 4
      2025-2 = 3
    */

    const termIndex =
      Math.min(
        Math.floor(
          recordIndex / 4
        ),
        terms.length - 1
      );


    // ==================================================
    // CREATE RECORD
    // ==================================================

    records.push({
      studentId:
        students[
          studentIndex
        ]._id,

      courseId:
        course._id,

      term:
        terms[
          termIndex
        ],

      grade,
    });
  }
}


// ======================================================
// FINAL VERIFICATION
// ======================================================

if (
  records.length !== 312
) {
  throw new Error(
    `Expected 312 academic records but created ${records.length}`
  );
}

await Record.insertMany(
  records
);

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

  const passingGrades =
    new Set([
      "A",
      "B+",
      "B",
      "C+",
      "C",
      "D+",
      "D",
    ]);

  const courseById =
    new Map();

  const courseByCode =
    new Map();

  courses.forEach((course) => {
    courseById.set(
      course._id.toString(),
      course
    );

    courseByCode.set(
      course.code,
      course
    );
  });

  const offeringsByCourse =
    new Map();

  courses.forEach((course) => {
    offeringsByCourse.set(
      course.code,
      []
    );
  });

  offerings.forEach(
    (offering) => {
      const course =
        courseById.get(
          offering.courseId.toString()
        );

      offeringsByCourse
        .get(course.code)
        .push(offering);
    }
  );

  const seatCounts =
    new Map();

  offerings.forEach(
    (offering) => {
      seatCounts.set(
        offering._id.toString(),
        0
      );
    }
  );

  const hasTimeClash = (
    first,
    second
  ) => {
    if (
      first.day !== second.day
    ) {
      return false;
    }

    return (
      first.startTime <
        second.endTime &&
      second.startTime <
        first.endTime
    );
  };

  const registrationsData = [];

  for (
    let studentIndex = 0;
    studentIndex <
      students.length;
    studentIndex++
  ) {
    const student =
      students[studentIndex];

    const history =
      await Record.find({
        studentId: student._id,
      });

    const passedCodes =
      new Set();

    const failedCodes = [];

    history.forEach((record) => {
      const course =
        courseById.get(
          record.courseId.toString()
        );

      if (!course) {
        return;
      }

      if (
        passingGrades.has(
          record.grade
        )
      ) {
        passedCodes.add(
          course.code
        );
      }

      if (
        record.grade === "F"
      ) {
        failedCodes.push(
          course.code
        );
      }
    });

    const eligibleCourses =
      courses.filter(
        (course) => {
          /*
            Already passed = cannot
            register again.
          */
          if (
            passedCodes.has(
              course.code
            )
          ) {
            return false;
          }

          /*
            Prerequisites must
            already be passed.
          */
          return course.prerequisites.every(
            (prerequisite) =>
              passedCodes.has(
                prerequisite
              )
          );
        }
      );

    /*
      Failed courses first.
    */
    const failedFirst = [];

    failedCodes.forEach((code) => {
      const course =
        eligibleCourses.find(
          (item) =>
            item.code === code
        );

      if (
        course &&
        !failedFirst.includes(course)
      ) {
        failedFirst.push(
          course
        );
      }
    });

    let remaining =
      eligibleCourses.filter(
        (course) =>
          !failedFirst.includes(
            course
          )
      );

    /*
      Rotate course order so all
      students do not receive the
      exact same schedule.
    */
    if (
      remaining.length > 0
    ) {
      const rotation =
        studentIndex %
        remaining.length;

      remaining = [
        ...remaining.slice(
          rotation
        ),
        ...remaining.slice(
          0,
          rotation
        ),
      ];
    }

   const candidates = [
  ...failedFirst,
  ...remaining,
];

/*
  Only consider courses that
  actually have an offering
  this term.
*/
const offeredCandidates =
  candidates.filter(
    (course) => {
      const sections =
        offeringsByCourse.get(
          course.code
        ) || [];

      return sections.length > 0;
    }
  );

/*
  Aim for 3 or 4 courses,
  but allow fewer for students
  who do not have enough
  remaining eligible courses.
*/
const desiredCount =
  studentIndex % 2 === 0
    ? 4
    : 3;

const targetCount =
  Math.min(
    desiredCount,
    offeredCandidates.length
  );

    const selectedOfferings = [];

    for (
  const course of offeredCandidates
) {
      const possibleSections =
        offeringsByCourse.get(
          course.code
        ) || [];

      const availableSections =
        possibleSections.filter(
          (offering) => {
            const taken =
              seatCounts.get(
                offering._id.toString()
              );

            if (
              taken >=
              offering.seats
            ) {
              return false;
            }

            const clashes =
              selectedOfferings.some(
                (selected) =>
                  hasTimeClash(
                    offering,
                    selected
                  )
              );

            return !clashes;
          }
        );

      if (
        availableSections.length ===
        0
      ) {
        continue;
      }

      /*
        Choose the least-filled
        section first.
      */
      availableSections.sort(
        (a, b) => {
          const aTaken =
            seatCounts.get(
              a._id.toString()
            );

          const bTaken =
            seatCounts.get(
              b._id.toString()
            );

          return (
            aTaken / a.seats -
            bTaken / b.seats
          );
        }
      );

      const chosen =
        availableSections[0];

      selectedOfferings.push(
        chosen
      );

      seatCounts.set(
        chosen._id.toString(),
        seatCounts.get(
          chosen._id.toString()
        ) + 1
      );

      if (
        selectedOfferings.length >=
        targetCount
      ) {
        break;
      }
    }

    if (
  selectedOfferings.length < 3
) {
  console.warn(
    `${student.studentId} has only ${selectedOfferings.length} eligible current course(s)`
  );
}

    for (
      const offering of
      selectedOfferings
    ) {
      registrationsData.push({
        studentId:
          student._id,

        offeringId:
          offering._id,

        term: "2026-1",

        status:
          "registered",
      });
    }
  }

  const registrations =
    await Registration.insertMany(
      registrationsData
    );

  /*
    Update actual seat counts.
  */
  for (
    const offering of offerings
  ) {
    const count =
      seatCounts.get(
        offering._id.toString()
      );

    await Offering.findByIdAndUpdate(
      offering._id,
      {
        $set: {
          seatsTaken: count,
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