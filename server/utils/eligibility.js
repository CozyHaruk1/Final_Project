const PASSING_GRADES = new Set([
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D",
]);

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

// Safely get a MongoDB ObjectId as a string.
// Works whether the value is populated or just an ObjectId.
const idOf = (value) => {
  if (!value) return null;

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};


// Convert "08:30" or "8:30" into minutes.
// This makes time comparison safer than comparing strings directly.
const timeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
};


// Check whether two course offerings overlap.
const timesOverlap = (a, b) => {
  if (!a || !b) {
    return false;
  }

  if (!a.day || !b.day) {
    return false;
  }

  // Different days cannot clash.
  if (a.day !== b.day) {
    return false;
  }

  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);

  if (
    aStart === null ||
    aEnd === null ||
    bStart === null ||
    bEnd === null
  ) {
    return false;
  }

  return aStart < bEnd && aEnd > bStart;
};


// Return a readable course code from a populated offering.
const getOfferingCourseCode = (offering) => {
  return (
    offering?.courseId?.code ||
    "another course"
  );
};


/*
|--------------------------------------------------------------------------
| Eligibility Builder
|--------------------------------------------------------------------------
|
| Expected inputs:
|
| courses
|   All courses in the catalogue.
|
| offerings
|   Offerings for the selected term only.
|
| records
|   Student academic history.
|
| registrations
|   Student registrations for the selected term.
|
| selectedOfferings
|   Optional offerings being selected during the current registration
|   process. Useful for checking clashes before saving.
|
| enforcePrerequisites
|   Optional extra rule.
|   The rubric does not require prerequisites, so it defaults to false.
|
|--------------------------------------------------------------------------
*/

const buildEligibility = ({
  courses = [],
  offerings = [],
  records = [],
  registrations = [],
  selectedOfferings = [],
  enforcePrerequisites = false,
}) => {

  /*
  |--------------------------------------------------------------------------
  | 1. Build academic history
  |--------------------------------------------------------------------------
  */

  const passedGrades = new Map();
  const failedCourses = new Set();
  const withdrawnCourses = new Set();

  for (const record of records) {
    const courseCode = record?.courseId?.code;
    const grade = record?.grade;

    if (!courseCode || !grade) {
      continue;
    }

    if (PASSING_GRADES.has(grade)) {
      passedGrades.set(courseCode, grade);
    }

    if (grade === "F") {
      failedCourses.add(courseCode);
    }

    if (grade === "W") {
      withdrawnCourses.add(courseCode);
    }
  }


  /*
  |--------------------------------------------------------------------------
  | 2. Current registrations
  |--------------------------------------------------------------------------
  |
  | Only "registered" courses should block another course.
  | A dropped course must NOT cause a duplicate or time clash.
  |
  */

  const currentOfferings = registrations
    .filter((registration) => {
      return (
        !registration.status ||
        registration.status === "registered"
      );
    })
    .map((registration) => registration.offeringId)
    .filter(Boolean);


  /*
  |--------------------------------------------------------------------------
  | 3. Include offerings currently being selected
  |--------------------------------------------------------------------------
  |
  | This helps detect a clash between:
  |
  | CSC220 selected now
  | ITE420 selected now
  |
  | even before either registration has been saved.
  |
  */

  const comparisonOfferings = [
    ...currentOfferings,
    ...selectedOfferings,
  ];


  /*
  |--------------------------------------------------------------------------
  | 4. Check every course
  |--------------------------------------------------------------------------
  */

  const results = courses.map((course) => {

    const courseCode = course.code;

    // Only sections passed into "offerings" are considered.
    // The controller should already filter them by selected term.
    const courseSections = offerings.filter((offering) => {
      return (
        idOf(offering.courseId) === idOf(course)
      );
    });


    /*
    |--------------------------------------------------------------------------
    | Academic state
    |--------------------------------------------------------------------------
    */

    const passed = passedGrades.has(courseCode);

    const passedGrade = passed
      ? passedGrades.get(courseCode)
      : null;

    // If they once failed but later passed, they no longer need a retake.
    const retakeRequired =
      failedCourses.has(courseCode) &&
      !passed;

    const withdrawn =
      withdrawnCourses.has(courseCode) &&
      !passed;

    const retakeAllowed =
      retakeRequired || withdrawn;


    /*
    |--------------------------------------------------------------------------
    | Course-level information
    |--------------------------------------------------------------------------
    */

    const common = {
      course,

      offered: courseSections.length > 0,

      passed,
      passedGrade,

      retakeRequired,
      retakeAllowed,

      withdrawn,
    };


    /*
    |--------------------------------------------------------------------------
    | Rule 1: Offered this term
    |--------------------------------------------------------------------------
    */

    if (courseSections.length === 0) {
      return {
        ...common,

        eligible: false,

        reason: "Not offered this term.",

        reasons: [
          "Not offered this term.",
        ],

        sections: [],
      };
    }


    /*
    |--------------------------------------------------------------------------
    | Optional prerequisite rule
    |--------------------------------------------------------------------------
    |
    | NOT required by the rubric.
    | Keep disabled unless you intentionally want this feature.
    |
    */

    let missingPrerequisites = [];

    if (
      enforcePrerequisites &&
      !retakeRequired
    ) {
      missingPrerequisites =
        (course.prerequisites || []).filter(
          (requiredCode) =>
            !passedGrades.has(requiredCode)
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Check each section
    |--------------------------------------------------------------------------
    */

    const sections = courseSections.map((offering) => {

      const seats =
        Number(offering.seats || 0);

      const seatsTaken =
        Number(offering.seatsTaken || 0);

      const seatsRemaining =
        Math.max(0, seats - seatsTaken);

      const full =
        seatsRemaining <= 0;

      const reasons = [];


      /*
      |--------------------------------------------------------------------------
      | Rule 2: Not already passed
      |--------------------------------------------------------------------------
      */

      if (passed) {
        reasons.push(
          `Already passed — grade ${passedGrade}.`
        );
      }


      /*
      |--------------------------------------------------------------------------
      | Already registered
      |--------------------------------------------------------------------------
      */

      const alreadyRegistered =
        currentOfferings.some(
          (currentOffering) =>
            idOf(currentOffering.courseId) ===
            idOf(course)
        );

      if (alreadyRegistered) {
        reasons.push(
          `Already registered for ${courseCode} this term.`
        );
      }


      /*
      |--------------------------------------------------------------------------
      | Optional prerequisite check
      |--------------------------------------------------------------------------
      */

      if (missingPrerequisites.length > 0) {
        reasons.push(
          `Prerequisite not met — requires ${missingPrerequisites.join(
            ", "
          )}.`
        );
      }


      /*
      |--------------------------------------------------------------------------
      | Rule 4: Seats available
      |--------------------------------------------------------------------------
      */

      if (full) {
        reasons.push(
          "Full — 0 seats remaining."
        );
      }


      /*
      |--------------------------------------------------------------------------
      | Rule 5: No time clash
      |--------------------------------------------------------------------------
      */

      const clash = comparisonOfferings.find(
        (otherOffering) => {

          // Do not compare an offering with itself.
          if (
            idOf(otherOffering) ===
            idOf(offering)
          ) {
            return false;
          }

          return timesOverlap(
            offering,
            otherOffering
          );
        }
      );


      if (clash) {
        const clashCourse =
          getOfferingCourseCode(clash);

        const clashSection =
          clash.section
            ? ` Section ${clash.section}`
            : "";

        reasons.push(
          `Clashes with ${clashCourse}${clashSection}.`
        );
      }


      /*
      |--------------------------------------------------------------------------
      | Section result
      |--------------------------------------------------------------------------
      */

      return {
        ...(
          typeof offering.toObject === "function"
            ? offering.toObject()
            : offering
        ),

        seatsRemaining,

        full,

        eligible:
          reasons.length === 0,

        reason:
          reasons[0] || null,

        reasons,
      };
    });


    /*
    |--------------------------------------------------------------------------
    | Course result
    |--------------------------------------------------------------------------
    */

    const eligibleSections =
      sections.filter(
        (section) => section.eligible
      );

    const eligible =
      eligibleSections.length > 0;

    const courseReasons = [
      ...new Set(
        sections.flatMap(
          (section) =>
            section.reasons || []
        )
      ),
    ];


    let reason = null;

    if (eligible && retakeRequired) {
      reason = "Retake required.";
    } else if (eligible && withdrawn) {
      reason = "Withdrawn previously — may retake.";
    } else if (!eligible) {
      reason =
        courseReasons[0] ||
        "No eligible sections available.";
    }


    return {
      ...common,

      eligible,

      reason,

      reasons: courseReasons,

      sections,
    };
  });


  /*
  |--------------------------------------------------------------------------
  | 5. Sort results
  |--------------------------------------------------------------------------
  |
  | Rubric:
  | F courses must be marked "Retake required"
  | and should appear first.
  |
  | After that, sort by course code.
  |
  */

  results.sort((a, b) => {

    if (
      a.retakeRequired !==
      b.retakeRequired
    ) {
      return a.retakeRequired
        ? -1
        : 1;
    }

    return a.course.code.localeCompare(
      b.course.code
    );
  });


  return results;
};


module.exports = {
  buildEligibility,
  timesOverlap,
  PASSING_GRADES,
};