function EligibleCourseList({ courses, selectedOfferingId, onSelectSection }) {
  if (!courses || courses.length === 0) {
    return <p>No course data available.</p>;
  }

  return (
    <div className="eligible-course-list">
      {courses.map((course) => (
        <div
          key={course.courseId}
          className={`eligible-course ${
            course.retakeRequired ? "retake-required" : ""
          }`}
        >
          <h4>
            {course.code} — {course.title}
            {course.retakeRequired && (
              <span className="badge badge-warning"> Retake Required</span>
            )}
          </h4>

          {!course.offered && (
            <p className="course-reason">Not offered this term.</p>
          )}

          {course.offered && course.sections.length === 0 && (
            <p className="course-reason">No sections available.</p>
          )}

          {course.offered && course.sections.length > 0 && (
            <table className="section-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Room</th>
                  <th>Instructor</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {course.sections.map((section) => {
                  const reasons = section.reasons || section.reason
                    ? section.reasons || [section.reason]
                    : [];

                  const isSelected =
                    selectedOfferingId === section.offeringId;

                  return (
                    <tr
                      key={section.offeringId}
                      className={
                        !section.eligible
                          ? "section-disabled"
                          : isSelected
                          ? "section-selected"
                          : ""
                      }
                    >
                      <td>{section.section}</td>
                      <td>{section.day}</td>
                      <td>
                        {section.startTime} - {section.endTime}
                      </td>
                      <td>{section.room}</td>
                      <td>{section.instructor}</td>
                      <td>
                        {section.seatsRemaining}/{section.seats}
                      </td>
                      <td>
                        {section.eligible ? (
                          "Available"
                        ) : (
                          <span className="course-reason">
                            {reasons.join("; ")}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          disabled={!section.eligible}
                          onClick={() => onSelectSection(course, section)}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

export default EligibleCourseList;