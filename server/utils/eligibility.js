const PASSING_GRADES = new Set([
  "A", "B+", "B", "C+", "C", "D+", "D",
]);

const timesOverlap = (a, b) => {
  if (!a || !b || !a.day || a.day !== b.day) return false;
  return a.startTime < b.endTime && a.endTime > b.startTime;
};

const idOf = (value) => value?._id?.toString() || value?.toString();

/** Build the course and section eligibility response from populated DB records. */
const buildEligibility = ({ courses, offerings, records, registrations }) => {
  const passedGrades = new Map();
  const failed = new Set();
  const withdrawn = new Set();

  for (const record of records) {
    const code = record.courseId?.code;
    if (!code) continue;
    if (PASSING_GRADES.has(record.grade)) passedGrades.set(code, record.grade);
    if (record.grade === "F") failed.add(code);
    if (record.grade === "W") withdrawn.add(code);
  }

  const current = registrations.map((r) => r.offeringId).filter(Boolean);
  const result = courses.map((course) => {
    const courseSections = offerings.filter(
      (offering) => idOf(offering.courseId) === idOf(course)
    );
    const passed = passedGrades.has(course.code);
    const retakeRequired = failed.has(course.code) && !passed;
    const retakeAllowed = retakeRequired || withdrawn.has(course.code);
    const common = {
      course,
      offered: courseSections.length > 0,
      retakeRequired,
      retakeAllowed,
    };

    if (!courseSections.length) {
      return { ...common, eligible: false, reason: "Not offered this term.", reasons: ["Not offered this term."], sections: [] };
    }

    const passedReason = passed ? `Already passed — grade ${passedGrades.get(course.code)}.` : null;
    const missing = !retakeAllowed
      ? (course.prerequisites || []).filter((code) => !passedGrades.has(code))
      : [];
    const sections = courseSections.map((offering) => {
      const remaining = Math.max(0, Number(offering.seats || 0) - Number(offering.seatsTaken || 0));
      const reasons = [];
      if (passedReason) reasons.push(passedReason);
      if (current.some((item) => idOf(item.courseId) === idOf(course))) reasons.push(`Already registered for ${course.code} this term.`);
      if (missing.length) reasons.push(`Prerequisite not met — requires ${missing.join(", ")}.`);
      if (remaining <= 0) reasons.push("Section is full — 0 seats remaining.");
      const clash = current.find((item) => idOf(item) !== idOf(offering) && timesOverlap(offering, item));
      if (clash) reasons.push(`Time clash with ${clash.courseId?.code || "another course"} Section ${clash.section} (${clash.day} ${clash.startTime}–${clash.endTime}).`);
      return {
        ...offering.toObject(),
        seatsRemaining: remaining,
        full: remaining <= 0,
        eligible: reasons.length === 0,
        reason: reasons[0] || null,
        reasons,
      };
    });

    const eligible = sections.some((section) => section.eligible);
    const reasons = [...new Set(sections.flatMap((section) => section.reasons))];
    return {
      ...common,
      eligible,
      reason: eligible ? (retakeRequired ? "F grade retake required; prioritized." : null) : (reasons[0] || "No eligible sections available."),
      reasons,
      sections,
    };
  });

  return result.sort((a, b) => Number(b.retakeRequired) - Number(a.retakeRequired) || a.course.code.localeCompare(b.course.code));
};

module.exports = { buildEligibility, timesOverlap, PASSING_GRADES };
