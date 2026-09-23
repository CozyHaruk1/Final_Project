import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import {
  getCurrentUser,
  getMyRegistrations
} from "../services/api";

function AddDrop() {
  const user = getCurrentUser();

  const [registrations, setRegistrations] = useState([]);
  const [advisor, setAdvisor] = useState(null);
  const [term, setTerm] = useState("");

  const [selectedRegistration, setSelectedRegistration] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAddDropData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyRegistrations();

        setRegistrations(
          data.registrations || []
        );

        setAdvisor(
          data.advisor || null
        );

        setTerm(
          data.term || ""
        );
      } catch (err) {
        setError(
          err.message ||
          "Could not load add/drop information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAddDropData();
  }, []);

  const handleRequest = (registration) => {
    setSelectedRegistration(registration);
  };

  const closeRequest = () => {
    setSelectedRegistration(null);
  };

  const selectedOffering =
    selectedRegistration?.offering;

  const selectedCourse =
    selectedOffering?.courseId;

  const emailSubject =
    selectedCourse
      ? `Add/Drop Request - ${user?.studentId || "Student"} - ${selectedCourse.code}`
      : "";

  const mailtoLink =
    advisor?.email
      ? `mailto:${advisor.email}?subject=${encodeURIComponent(
          emailSubject
        )}`
      : "#";

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="Add / Drop"
          name={user?.name || "Student"}
          role="Student"
        />

        <div className="add-drop-page-intro">
          <div>
            <h2>
              Add / Drop Requests
            </h2>

            <p>
              View the add/drop status of your
              registered courses for{" "}
              {term || "the current term"}.
            </p>
          </div>
        </div>

        {loading && (
          <Loading
            message="Loading add/drop information..."
          />
        )}

        {error && (
          <ErrorMessage
            message={error}
          />
        )}

        {!loading &&
          !error &&
          registrations.length === 0 && (
            <section className="panel">
              <div className="browse-empty">
                <h3>
                  No registered courses
                </h3>

                <p>
                  You do not currently have any
                  courses available for add/drop.
                </p>
              </div>
            </section>
          )}

        {!loading &&
          !error &&
          registrations.length > 0 && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Registered Courses
                  </h2>

                  <p>
                    Request changes only when
                    add/drop is open.
                  </p>
                </div>
              </div>

              <div className="add-drop-course-list">
                {registrations.map(
                  (registration) => {
                    const offering =
                      registration.offering;

                    const course =
                      offering?.courseId;

                    if (!offering || !course) {
                      return null;
                    }

                    const isOpen =
                      offering.addDropOpen === true;

                    return (
                      <div
                        className="add-drop-course-card"
                        key={registration.id}
                      >
                        <div className="add-drop-course-info">
                          <div>
                            <span className="course-code-label">
                              {course.code}
                            </span>

                            <h3>
                              {course.title}
                            </h3>

                            <p>
                              Section{" "}
                              {offering.section}
                              {" • "}
                              {offering.day}
                              {" • "}
                              {offering.startTime}
                              {" - "}
                              {offering.endTime}
                            </p>
                          </div>

                          <span
                            className={
                              isOpen
                                ? "status add-drop-open"
                                : "status add-drop-closed"
                            }
                          >
                            {isOpen
                              ? "Add/Drop Open"
                              : "Add/Drop Closed"}
                          </span>
                        </div>

                        <div className="add-drop-course-action">
                          {isOpen ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleRequest(
                                  registration
                                )
                              }
                            >
                              Request Add/Drop
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="disabled-request"
                            >
                              Requests Closed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

        {selectedRegistration &&
          selectedOffering &&
          selectedCourse && (
            <section className="panel request-content">
              <div className="panel-header">
                <div>
                  <h2>
                    Add/Drop Request
                  </h2>

                  <p>
                    {selectedCourse.code}
                    {" - "}
                    {selectedCourse.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRequest}
                >
                  Close
                </button>
              </div>

              <div className="advisor-card">
                <div>
                  <span>
                    Academic Advisor
                  </span>

                  <strong>
                    {advisor?.name ||
                      "Advisor not assigned"}
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {advisor?.email ||
                      "No advisor email available"}
                  </strong>
                </div>
              </div>

              <div className="request-steps">
                <h3>
                  Request Instructions
                </h3>

                <ol>
                  <li>
                    Download and open the
                    Add/Drop Request form.
                  </li>

                  <li>
                    Fill in your student ID,
                    name, term, course code and
                    section.
                  </li>

                  <li>
                    State the reason for the
                    request and sign the form.
                  </li>

                  <li>
                    Email the completed form to
                    your advisor using the
                    subject:
                    <br />

                    <strong>
                      {emailSubject}
                    </strong>
                  </li>

                  <li>
                    Your advisor will confirm by
                    email after the registration
                    has been updated.
                  </li>
                </ol>
              </div>

              <div className="add-drop-request-actions">
                <a
                  className="download-form"
                  href="/AddDropRequest.pdf"
                  download
                >
                  Download Add/Drop Form
                </a>

                {advisor?.email ? (
                  <a
                    className="email-advisor-button"
                    href={mailtoLink}
                  >
                    Email Advisor
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="disabled-request"
                  >
                    Advisor Email Unavailable
                  </button>
                )}
              </div>
            </section>
          )}
      </main>
    </div>
  );
}

export default AddDrop;