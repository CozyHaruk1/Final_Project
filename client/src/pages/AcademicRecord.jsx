import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import {
  getCurrentUser,
  getMyRecord
} from "../services/api";

function AcademicRecord() {
  const currentUser = getCurrentUser();

  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [groupedByTerm, setGroupedByTerm] = useState({});
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecord = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyRecord();

        setStudent(data.student || null);

        setRecords(
          data.records || []
        );

        setGroupedByTerm(
          data.groupedByTerm || {}
        );

        setTotalCreditsEarned(
          data.totalCreditsEarned || 0
        );
      } catch (err) {
        setError(
          err.message ||
          "Could not load your academic record."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, []);

  const passedCourses = records.filter(
    (record) => record.passed
  );

  const failedCourses = records.filter(
    (record) => record.retakeRequired
  );

  const termEntries = Object.entries(
    groupedByTerm
  ).reverse();

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="Academic Record"
          name={
            student?.name ||
            currentUser?.name ||
            "Student"
          }
          role="Student"
        />

        {loading && (
          <Loading
            message="Loading academic record..."
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
                  🎓
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
                <div className="card-icon green">
                  ✓
                </div>

                <div>
                  <p>
                    Courses Passed
                  </p>

                  <h2>
                    {passedCourses.length}
                  </h2>

                  <span>
                    completed courses
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="card-icon orange">
                  📚
                </div>

                <div>
                  <p>
                    Total Records
                  </p>

                  <h2>
                    {records.length}
                  </h2>

                  <span>
                    academic history
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="card-icon purple">
                  ↻
                </div>

                <div>
                  <p>
                    Retakes Required
                  </p>

                  <h2>
                    {failedCourses.length}
                  </h2>

                  <span>
                    courses graded F
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
                      Courses with a grade of F
                      must be retaken.
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
                          {record.term}
                          {" • Grade "}
                          {record.grade}
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

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Academic History
                  </h2>

                  <p>
                    Completed courses grouped
                    by term
                  </p>
                </div>

                {student?.studentId && (
                  <span className="graduation">
                    {student.studentId}
                  </span>
                )}
              </div>

              {termEntries.length === 0 ? (
                <div className="browse-empty">
                  <h3>
                    No academic records
                  </h3>

                  <p>
                    No completed courses
                    were found.
                  </p>
                </div>
              ) : (
                <div className="record-terms">

                  {termEntries.map(
                    ([term, termRecords]) => (
                      <div
                        className="record-term"
                        key={term}
                      >
                        <h3>
                          Term {term}
                        </h3>

                        <div className="record-table">

                          <div className="record-row record-heading">
                            <span>
                              Course
                            </span>

                            <span>
                              Title
                            </span>

                            <span>
                              Credits
                            </span>

                            <span>
                              Grade
                            </span>

                            <span>
                              Status
                            </span>
                          </div>

                          {termRecords.map(
                            (record) => (
                              <div
                                className="record-row"
                                key={record.id}
                              >
                                <strong>
                                  {record.course
                                    ?.code ||
                                    "N/A"}
                                </strong>

                                <span>
                                  {record.course
                                    ?.title ||
                                    "Unknown Course"}
                                </span>

                                <span>
                                  {record.course
                                    ?.credits ||
                                    0}
                                </span>

                                <strong
                                  className={
                                    record.grade ===
                                    "F"
                                      ? "grade-fail"
                                      : ""
                                  }
                                >
                                  {record.grade}
                                </strong>

                                <span>
                                  {record.retakeRequired
                                    ? (
                                      <span className="retake-badge">
                                        Retake Required
                                      </span>
                                    )
                                    : record.passed
                                      ? "Passed"
                                      : "Not completed"}
                                </span>
                              </div>
                            )
                          )}

                        </div>
                      </div>
                    )
                  )}

                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AcademicRecord;