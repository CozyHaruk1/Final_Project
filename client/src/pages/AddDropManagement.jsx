import { useState } from "react";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdvisorSidebar from "../components/advisor/AdvisorSidebar";
import StudentSearch from "../components/advisor/StudentSearch";
import EligibleCourseList from "../components/advisor/EligibleCourseList";

const CURRENT_TERM = "2026-1";

function AddDropManagement() {
  const currentUser = getCurrentUser();

  const [student, setStudent] = useState(null);
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
      const [eligibleData, registrationsData] = await Promise.all([
        apiRequest(`/students/${studentId}/eligible?term=${CURRENT_TERM}`),
        apiRequest(`/students/${studentId}/registrations?term=${CURRENT_TERM}`),
      ]);

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
    loadStudentData(selected._id);
  };

  const handleSelectSection = (course, section) => {
    setSelectedCourse(course);
    setSelectedSection(section);
  };

  const handleCancelSelection = () => {
    setSelectedCourse(null);
    setSelectedSection(null);
  };

  const handleConfirmAdd = async () => {
    if (!student || !selectedSection) {
      return;
    }

    const sure = window.confirm(
      `Add ${student.name} to ${selectedCourse.code} Section ${selectedSection.section}?`
    );

    if (!sure) {
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
        `${student.name} was added to ${selectedCourse.code} Section ${selectedSection.section}.`
      );

      setSelectedCourse(null);
      setSelectedSection(null);

      await loadStudentData(student._id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDrop = async (registration) => {
    const sure = window.confirm(
      `Drop ${registration.offering.courseId.code} Section ${registration.offering.section} for ${student.name}?`
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
        `${registration.offering.courseId.code} was dropped from ${student.name}'s schedule.`
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
          title="Add / Drop Management"
          name={currentUser ? currentUser.name : "Advisor"}
          role="Advisor"
        />

        <div className="admin-content">
          <StudentSearch onSelect={handleSelectStudent} />

          {message && <p className="success-message">{message}</p>}
          {error && <ErrorMessage message={error} />}

          {loading && <Loading message="Loading student data..." />}

          {student && !loading && (
            <>
              <h3>
                {student.name} ({student.studentId})
              </h3>

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
                      <th>Status</th>
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
                        <td>{registration.status}</td>
                        <td>
                          <button onClick={() => handleDrop(registration)}>
                            Drop
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h4>Add Eligible Course</h4>

              <EligibleCourseList
                courses={eligible?.courses}
                selectedOfferingId={selectedSection?.offeringId}
                onSelectSection={handleSelectSection}
              />

              {selectedSection && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h4>Confirm Add</h4>
                    <p>
                      Add <strong>{student.name}</strong> to{" "}
                      <strong>
                        {selectedCourse.code} — {selectedCourse.title}
                      </strong>
                      , Section {selectedSection.section} (
                      {selectedSection.day} {selectedSection.startTime}-
                      {selectedSection.endTime})?
                    </p>
                    <button onClick={handleConfirmAdd}>Confirm</button>
                    <button onClick={handleCancelSelection}>Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default AddDropManagement;
