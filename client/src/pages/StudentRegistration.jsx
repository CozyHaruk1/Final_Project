import { useState } from "react";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdvisorSidebar from "../components/advisor/AdvisorSidebar";
import StudentSearch from "../components/advisor/StudentSearch";
import EligibleCourseList from "../components/advisor/EligibleCourseList";

const CURRENT_TERM = "2026-1";

function StudentRegistration() {
  const currentUser = getCurrentUser();

  const [student, setStudent] = useState(null);
  const [record, setRecord] = useState(null);
  const [eligible, setEligible] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const loadStudentData = async (studentId) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [recordData, eligibleData, registrationsData] = await Promise.all([
        apiRequest(`/students/${studentId}/record`),
        apiRequest(`/students/${studentId}/eligible?term=${CURRENT_TERM}`),
        apiRequest(`/students/${studentId}/registrations?term=${CURRENT_TERM}`),
      ]);

      setRecord(recordData);
      setEligible(eligibleData);
      setRegistrations(registrationsData.registrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (selected) => {
    setStudent(selected);
    setSelectedCourse(null);
    setSelectedSection(null);
    setMessage("");
    setError("");
    loadStudentData(selected._id);
  };

  const handleBackToSearch = () => {
    setStudent(null);
    setRecord(null);
    setEligible(null);
    setRegistrations([]);
    setSelectedCourse(null);
    setSelectedSection(null);
    setMessage("");
    setError("");
  };

  const handleSelectSection = (course, section) => {
    setSelectedCourse(course);
    setSelectedSection(section);
  };

  const handleCancelSelection = () => {
    setSelectedCourse(null);
    setSelectedSection(null);
  };

  const handleConfirmRegister = async () => {
    if (!student || !selectedSection) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest("/registrations", {
        method: "POST",
        body: JSON.stringify({
          studentId: student._id,
          offeringId: selectedSection.offeringId,
        }),
      });

      setMessage(
        `${student.name} was registered into ${selectedCourse.code} Section ${selectedSection.section}.`
      );

      setSelectedCourse(null);
      setSelectedSection(null);

      await loadStudentData(student._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveRegistration = async (registration) => {
    const sure = window.confirm(
      `Remove ${registration.offering.courseId.code} Section ${registration.offering.section} for ${student.name}?`
    );

    if (!sure) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/registrations/${registration.id}`, {
        method: "DELETE",
      });

      setMessage(
        `${registration.offering.courseId.code} was removed from ${student.name}'s schedule.`
      );

      await loadStudentData(student._id);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="student-layout">
      <AdvisorSidebar />

      <main className="main">
        <Header
          title="Student Registration"
          name={currentUser ? currentUser.name : "Advisor"}
          role="Advisor"
        />

        <div className="admin-content">
          {!student && <StudentSearch onSelect={handleSelectStudent} />}

          {!student && error && <ErrorMessage message={error} />}

          {student && (
            <div className="student-record">
              <button onClick={handleBackToSearch}>&larr; Back to search</button>

              {message && <p className="success-message">{message}</p>}
              {error && <ErrorMessage message={error} />}

              {loading && <Loading message="Loading student data..." />}

              {!loading && (
                <>
                  <h3>
                {student.name} ({student.studentId})
              </h3>

              {record?.academicSummary && (
                <div className="academic-summary">
                  <p>GPA: {record.academicSummary.gpa}</p>
                  <p>Total Credits: {record.academicSummary.totalCredits}</p>
                  <p>Progress: {record.academicSummary.progress}%</p>
                  {record.academicSummary.retakeCourses.length > 0 && (
                    <p>
                      Retake Required:{" "}
                      {record.academicSummary.retakeCourses.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {record?.records && record.records.length > 0 && (
                <>
                  <h4>Completed Courses</h4>
                  <table className="section-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Term</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.records.map((r) => (
                        <tr key={r._id}>
                          <td>
                            {r.courseId?.code} - {r.courseId?.title}
                          </td>
                          <td>{r.term}</td>
                          <td>
                            {r.grade === "F" ? (
                              <span className="badge badge-warning">F (Failed)</span>
                            ) : (
                              r.grade
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <h4>Current Registrations ({CURRENT_TERM})</h4>

              {registrations.length === 0 ? (
                <p>No current registrations.</p>
              ) : (
                <table className="section-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Day/Time</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration.id}>
                        <td>
                          {registration.offering.courseId.code} -{" "}
                          {registration.offering.courseId.title}
                        </td>
                        <td>{registration.offering.section}</td>
                        <td>
                          {registration.offering.day}{" "}
                          {registration.offering.startTime}-
                          {registration.offering.endTime}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              handleRemoveRegistration(registration)
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h4>Eligible Courses</h4>

              <EligibleCourseList
                courses={eligible?.courses}
                selectedOfferingId={selectedSection?.offeringId}
                onSelectSection={handleSelectSection}
              />

              {selectedSection && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h4>Confirm Registration</h4>
                    <p>
                      Register <strong>{student.name}</strong> into{" "}
                      <strong>
                        {selectedCourse.code} — {selectedCourse.title}
                      </strong>
                      , Section {selectedSection.section} (
                      {selectedSection.day} {selectedSection.startTime}-
                      {selectedSection.endTime})?
                    </p>
                    <div className="modal-actions">
                      <button className="btn-primary" onClick={handleConfirmRegister}>Confirm</button>
                      <button className="btn-secondary" onClick={handleCancelSelection}>Cancel</button>
                    </div>
                  </div>
                </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentRegistration;
