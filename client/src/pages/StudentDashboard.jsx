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

  const [totalCreditsEarned, setTotalCreditsEarned] =
    useState(0);

  const [gpa, setGpa] =
    useState(0);

  const [term, setTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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

        // =========================
        // CURRENT REGISTRATIONS
        // =========================

        setRegistrations(
          registrationData.registrations || []
        );

        setTerm(
          registrationData.term || ""
        );


        // =========================
        // STUDENT INFORMATION
        // =========================

        setStudent(
          recordData.student || null
        );


        // =========================
        // ACADEMIC RECORD
        // New studentController uses courseId
        // =========================

        const normalizedRecords =
          (recordData.records || []).map(
            (record) => ({
              id:
                record._id ||
                record.id,

              term:
                record.term,

              course:
                record.courseId ||
                record.course,

              grade:
                record.grade,

              retakeRequired:
                record.retakeRequired === true
            })
          );

        setRecords(
          normalizedRecords
        );


        // =========================
        // ACADEMIC SUMMARY
        // =========================

        const summary =
          recordData.academicSummary || {};

        setTotalCreditsEarned(
          summary.totalCredits ?? 0
        );

        setGpa(
          summary.gpa ?? 0
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


  // =========================
  // CURRENT CREDITS
  // =========================

  const currentCredits =
    registrations.reduce(
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


  // =========================
  // RETAKE COURSES
  // =========================

  const failedCourses =
    records.filter(
      (record) =>
        record.retakeRequired
    );


  // =========================
  // GRADUATION PROGRESS
  // =========================

  const graduationTarget = 160;

  const progressPercent =
    Math.min(
      100,
      Math.round(
        (
          totalCreditsEarned /
          graduationTarget
        ) * 100
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

            {/* =========================
                STAT CARDS
            ========================= */}

            <div className="cards">

              {/* CURRENT CREDITS */}

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


              {/* CREDITS EARNED */}

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


              {/* CURRENT TERM */}

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
                      currentUser?.studentId ||
                      "Student"}
                  </span>
                </div>

              </div>


              {/* GPA */}

              <div className="card">

                <div className="card-icon purple">
                  📊
                </div>

                <div>
                  <p>
                    GPA
                  </p>

                  <h2>
                    {Number(gpa).toFixed(2)}
                  </h2>

                  <span>
                    Cumulative GPA
                  </span>
                </div>

              </div>

            </div>


            {/* =========================
                RETAKE WARNING
            ========================= */}

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
                          {record.course?.code ||
                            "Unknown Course"}

                          {" - "}

                          {record.course?.title ||
                            ""}
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


            {/* =========================
                CURRENT COURSES
                + ADD DROP
            ========================= */}

            <div className="content-grid">

              {/* CURRENT COURSES */}

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


              {/* ADD / DROP */}

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

                  {registrations.length === 0 ? (

                    <div className="browse-empty">

                      <h3>
                        No courses
                      </h3>

                      <p>
                        No registered courses
                        available.
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
                    )

                  )}

                </div>

              </section>

            </div>


            {/* =========================
                ACADEMIC PROGRESS
            ========================= */}

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
                    {totalCreditsEarned}
                    {" "}
                    credits earned
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