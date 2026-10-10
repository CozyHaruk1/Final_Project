import { useEffect, useState } from "react";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdvisorSidebar from "../components/advisor/AdvisorSidebar";
import StudentSearch from "../components/advisor/StudentSearch";

const CURRENT_TERM = "2026-1";

function AddDropManagement() {
  const currentUser = getCurrentUser();

  const [offerings, setOfferings] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedOffering, setSelectedOffering] = useState(null);
  const [roster, setRoster] = useState([]);

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [studentToAdd, setStudentToAdd] = useState(null);
  const [registrationToRemove, setRegistrationToRemove] = useState(null);

  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOfferings = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/offerings?term=${CURRENT_TERM}`);
      setOfferings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadRoster = async (offeringId) => {
    setRosterLoading(true);
    setError("");

    try {
      const data = await apiRequest(`/offerings/${offeringId}/registrations`);
      setRoster(data.roster || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleSelectOffering = (offering) => {
    setSelectedOffering(offering);
    setShowAddPanel(false);
    setMessage("");
    setError("");
    loadRoster(offering._id);
  };

  const handleBackToOfferings = () => {
    setSelectedOffering(null);
    setRoster([]);
    setShowAddPanel(false);
  };

  const handleSelectStudentToAdd = (student) => {
    setStudentToAdd(student);
  };

  const handleCancelAdd = () => {
    setStudentToAdd(null);
  };

  const handleConfirmAdd = async () => {
    if (!selectedOffering || !studentToAdd) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest("/registrations", {
        method: "POST",
        body: JSON.stringify({
          studentId: studentToAdd._id,
          offeringId: selectedOffering._id,
        }),
      });

      setMessage(
        `${studentToAdd.name} was added to ${selectedOffering.courseId.code} Section ${selectedOffering.section}.`
      );

      setStudentToAdd(null);
      setShowAddPanel(false);

      await loadRoster(selectedOffering._id);
      await loadOfferings();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequestRemove = (entry) => {
    setRegistrationToRemove(entry);
  };

  const handleCancelRemove = () => {
    setRegistrationToRemove(null);
  };

  const handleConfirmRemove = async () => {
    if (!registrationToRemove || !selectedOffering) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await apiRequest(`/registrations/${registrationToRemove.registrationId}`, {
        method: "DELETE",
      });

      setMessage(
        `${registrationToRemove.studentName} was dropped from ${selectedOffering.courseId.code} Section ${selectedOffering.section}.`
      );

      setRegistrationToRemove(null);

      await loadRoster(selectedOffering._id);
      await loadOfferings();
    } catch (err) {
      setError(err.message);
    }
  };

  const text = search.trim().toLowerCase();

  const shownOfferings = offerings.filter((offering) => {
    if (!text) {
      return true;
    }

    const course = offering.courseId;
    return (
      (course?.code || "").toLowerCase().includes(text) ||
      (course?.title || "").toLowerCase().includes(text) ||
      offering.section.toLowerCase().includes(text) ||
      offering.instructor.toLowerCase().includes(text)
    );
  });

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
          {!selectedOffering && (
            <>
              <input
                type="text"
                placeholder="Search by course, section or instructor"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {error && <ErrorMessage message={error} />}

              {loading ? (
                <Loading message="Loading offerings..." />
              ) : (
                <table className="section-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Day/Time</th>
                      <th>Instructor</th>
                      <th>Seats</th>
                      <th>Add/Drop</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownOfferings.map((offering) => (
                      <tr key={offering._id}>
                        <td>
                          {offering.courseId?.code} -{" "}
                          {offering.courseId?.title}
                        </td>
                        <td>{offering.section}</td>
                        <td>
                          {offering.day} {offering.startTime}-
                          {offering.endTime}
                        </td>
                        <td>{offering.instructor}</td>
                        <td>
                          {offering.seatsTaken}/{offering.seats}
                        </td>
                        <td>
                          {offering.addDropOpen
                            ? `Open until ${new Date(
                                offering.addDropCloseDate
                              ).toLocaleDateString()}`
                            : "Closed"}
                        </td>
                        <td>
                          <button onClick={() => handleSelectOffering(offering)}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {selectedOffering && (
            <div className="offering-roster">
              <button onClick={handleBackToOfferings}>
                &larr; Back to offerings
              </button>

              <h3>
                {selectedOffering.courseId?.code} —{" "}
                {selectedOffering.courseId?.title} (Section{" "}
                {selectedOffering.section})
              </h3>

              {message && <p className="success-message">{message}</p>}
              {error && <ErrorMessage message={error} />}

              <h4>Registered Students</h4>

              {rosterLoading ? (
                <Loading message="Loading roster..." />
              ) : roster.length === 0 ? (
                <p>No students currently registered in this section.</p>
              ) : (
                <table className="section-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Email</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((entry) => (
                      <tr key={entry.registrationId}>
                        <td>{entry.studentName}</td>
                        <td>{entry.studentCode}</td>
                        <td>{entry.studentEmail}</td>
                        <td>
                          <button onClick={() => handleRequestRemove(entry)}>
                            Drop
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h4>Add a Student to This Section</h4>

              {!showAddPanel ? (
                <button onClick={() => setShowAddPanel(true)}>
                  Add student
                </button>
              ) : (
                <StudentSearch onSelect={handleSelectStudentToAdd} />
              )}

              {studentToAdd && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h4>Confirm Add</h4>
                    <p>
                      Add <strong>{studentToAdd.name}</strong> to{" "}
                      <strong>
                        {selectedOffering.courseId?.code} Section{" "}
                        {selectedOffering.section}
                      </strong>
                      ?
                    </p>
                    <div className="modal-actions">
                      <button className="btn-primary" onClick={handleConfirmAdd}>
                        Confirm
                      </button>
                      <button className="btn-secondary" onClick={handleCancelAdd}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {registrationToRemove && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h4>Confirm Drop</h4>
                    <p>
                      Drop <strong>{registrationToRemove.studentName}</strong>{" "}
                      from{" "}
                      <strong>
                        {selectedOffering.courseId?.code} Section{" "}
                        {selectedOffering.section}
                      </strong>
                      ?
                    </p>
                    <div className="modal-actions">
                      <button className="btn-primary" onClick={handleConfirmRemove}>
                        Confirm
                      </button>
                      <button className="btn-secondary" onClick={handleCancelRemove}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AddDropManagement;
