import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import {
  getCurrentUser,
  getMyRegistrations
} from "../services/api";

function MyCourses() {
  const user = getCurrentUser();

  const [registrations, setRegistrations] = useState([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyRegistrations();

        setRegistrations(
          data.registrations || []
        );

        setTerm(
          data.term || ""
        );
      } catch (err) {
        setError(
          err.message ||
          "Could not load your courses."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, []);

  const totalCredits = registrations.reduce(
    (total, registration) => {
      const credits =
        registration.offering
          ?.courseId
          ?.credits || 0;

      return total + credits;
    },
    0
  );

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="My Courses"
          name={user?.name || "Student"}
          role="Student"
        />

        <div className="courses-summary">
          <div>
            <h2>Current Courses</h2>

            <p>
              Registered courses for{" "}
              {term || "current term"}
            </p>
          </div>

          <span className="credit-summary">
            {totalCredits} / 16 Credits
          </span>
        </div>

        <section className="panel">
          {loading && (
            <Loading
              message="Loading your courses..."
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
              <div className="browse-empty">
                <h3>
                  No registered courses
                </h3>

                <p>
                  You do not have any
                  courses registered for
                  this term.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            registrations.length > 0 && (
              <div className="my-courses-list">

                {registrations.map(
                  (registration) => {
                    const offering =
                      registration.offering;

                    const course =
                      offering?.courseId;

                    if (!offering || !course) {
                      return null;
                    }

                    return (
                      <div
                        className="my-course-card"
                        key={registration.id}
                      >
                        <div className="my-course-header">
                          <div>
                            <span className="course-code-label">
                              {course.code}
                            </span>

                            <h3>
                              {course.title}
                            </h3>
                          </div>

                          <span
                            className={
                              offering.addDropOpen
                                ? "status add-drop-open"
                                : "status add-drop-closed"
                            }
                          >
                            {offering.addDropOpen
                              ? "Add/Drop Open"
                              : "Add/Drop Closed"}
                          </span>
                        </div>

                        <div className="course-details-grid">
                          <div>
                            <span>
                              Section
                            </span>

                            <strong>
                              {offering.section}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Credits
                            </span>

                            <strong>
                              {course.credits}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Day
                            </span>

                            <strong>
                              {offering.day}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Time
                            </span>

                            <strong>
                              {offering.startTime}
                              {" - "}
                              {offering.endTime}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Room
                            </span>

                            <strong>
                              {offering.room || "TBA"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Instructor
                            </span>

                            <strong>
                              {offering.instructor || "TBA"}
                            </strong>
                          </div>
                        </div>

                        <div className="my-course-footer">
                          <span>
                            Status:{" "}
                            <strong>
                              {registration.status}
                            </strong>
                          </span>

                          <span>
                            Seats remaining:{" "}
                            <strong>
                              {offering.seatsRemaining}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default MyCourses;