import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import {
  getCurrentUser,
  getMyRegistrations,
  getMyRecord
} from "../services/api";

function StudentDashboard() {
  const currentUser = getCurrentUser();

  const [student, setStudent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [records, setRecords] = useState([]);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [term, setTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          registrationData,
          recordData
        ] = await Promise.all([
          getMyRegistrations(),
          getMyRecord()
        ]);

        setRegistrations(
          registrationData.registrations || []
        );

        setTerm(
          registrationData.term || ""
        );

        setStudent(
          recordData.student || null
        );

        setRecords(
          recordData.records || []
        );

        setTotalCreditsEarned(
          recordData.totalCreditsEarned || 0
        );
      } catch (err) {
        setError(
          err.message ||
          "Could not load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const currentCredits = registrations.reduce(
    (total, registration) => {
      return (
        total +
        (
          registration.offering
            ?.courseId
            ?.credits || 0
        )
      );
    },
    0
  );

  const failedCourses = records.filter(
    (record) => record.retakeRequired
  );

  const graduationTarget = 160;

  const progressPercent = Math.min(
    100,
    Math.round(
      (totalCreditsEarned /
        graduationTarget) *
        100
    )
  );

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="Dashboard"
          name={
            student?.name ||
            currentUser?.name ||
            "Student"
          }
          role="Student"
        />

        {loading && (
          <Loading
            message="Loading dashboard..."
          />
        )}

        {error && (
          <ErrorMessage
            message={error}
          />
        )}

        {!loading && !error && (
          <>
            <div className="cards">
              <div className="card">
                <div className="card-icon blue">
                  📚
                </div>

                <div>
                  <p>
                    Current Credits
                  </p>

                  <h2>
                    {currentCredits} / 16
                  </h2>

                  <span>
                    {registrations.length}
                    {" "}
                    registered courses
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="card-icon green">
                  ✓
                </div>

                <div>
                  <p>
                    Credits Earned
                  </p>

                  <h2>
                    {totalCreditsEarned}
                  </h2>

                  <span>
                    of 160 credits
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="card-icon orange">
                  🎓
                </div>

                <div>
                  <p>
                    Current Term
                  </p>

                  <h2>
                    {term || "N/A"}
                  </h2>

                  <span>
                    {student?.studentId ||
                      "Student"}
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="card-icon purple">
                  📊
                </div>

                <div>
                  <p>
                    Progress
                  </p>

                  <h2>
                    {progressPercent}%
                  </h2>

                  <span>
                    toward graduation
                  </span>
                </div>
              </div>
            </div>

            {failedCourses.length > 0 && (
              <section className="panel retake-panel">
                <div className="panel-header">
                  <div>
                    <h2>
                      Retake Required
                    </h2>

                    <p>
                      Courses graded F must
                      be retaken.
                    </p>
                  </div>
                </div>

                {failedCourses.map(
                  (record) => (
                    <div
                      className="retake-course"
                      key={record.id}
                    >
                      <div>
                        <strong>
                          {record.course?.code}
                          {" - "}
                          {record.course?.title}
                        </strong>

                        <p>
                          Grade {record.grade}
                          {" • "}
                          {record.term}
                        </p>
                      </div>

                      <span className="retake-badge">
                        Retake Required
                      </span>
                    </div>
                  )
                )}
              </section>
            )}

            <div className="content-grid">
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2>
                      Current Courses
                    </h2>

                    <p>
                      Registered courses for{" "}
                      {term ||
                        "the current term"}
                    </p>
                  </div>

                  <Link
                    className="outline-btn"
                    to="/student/courses"
                  >
                    View All
                  </Link>
                </div>

                <div className="current-courses">
                  {registrations.length === 0 ? (
                    <div className="browse-empty">
                      <h3>
                        No courses registered
                      </h3>

                      <p>
                        No current
                        registrations were
                        found.
                      </p>
                    </div>
                  ) : (
                    registrations.map(
                      (registration) => {
                        const offering =
                          registration.offering;

                        const course =
                          offering?.courseId;

                        if (
                          !offering ||
                          !course
                        ) {
                          return null;
                        }

                        return (
                          <div
                            className="course"
                            key={registration.id}
                          >
                            <div className="course-code">
                              <strong>
                                {course.code}
                              </strong>

                              <span>
                                Sec{" "}
                                {offering.section}
                              </span>
                            </div>

                            <div className="course-info">
                              <h3>
                                {course.title}
                              </h3>

                              <p>
                                {offering.day}
                                {" • "}
                                {offering.startTime}
                                {" - "}
                                {offering.endTime}
                              </p>

                              <p>
                                {offering.room ||
                                  "TBA"}
                                {" • "}
                                {offering.instructor ||
                                  "TBA"}
                              </p>
                            </div>

                            <div className="course-credit">
                              <strong>
                                {course.credits}
                              </strong>

                              <small>
                                Credits
                              </small>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2>
                      Add / Drop
                    </h2>

                    <p>
                      Current request status
                    </p>
                  </div>

                  <Link
                    className="outline-btn"
                    to="/student/add-drop"
                  >
                    Open Page
                  </Link>
                </div>

                <div className="add-drop-list">
                  {registrations.map(
                    (registration) => {
                      const offering =
                        registration.offering;

                      const course =
                        offering?.courseId;

                      if (
                        !offering ||
                        !course
                      ) {
                        return null;
                      }

                      return (
                        <div
                          className="add-drop-item"
                          key={registration.id}
                        >
                          <div>
                            <strong>
                              {course.code}
                            </strong>

                            <p>
                              Section{" "}
                              {offering.section}
                            </p>
                          </div>

                          <span
                            className={
                              offering.addDropOpen
                                ? "status add-drop-open"
                                : "status add-drop-closed"
                            }
                          >
                            {offering.addDropOpen
                              ? "Open"
                              : "Closed"}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            </div>

            <section className="panel progress-panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Academic Progress
                  </h2>

                  <p>
                    Progress toward
                    graduation requirement
                  </p>
                </div>

                <span className="graduation">
                  {Math.max(
                    0,
                    graduationTarget -
                      totalCreditsEarned
                  )}
                  {" "}
                  credits remaining
                </span>
              </div>

              <div className="progress-container">
                <div className="progress-label">
                  <span>
                    {totalCreditsEarned} credits
                    earned
                  </span>

                  <strong>
                    {progressPercent}%
                  </strong>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        `${progressPercent}%`
                    }}
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;