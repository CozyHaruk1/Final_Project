import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import {
  getCurrentUser,
  getMyRecord
} from "../services/api";

const PASSING_GRADES = [
  "A",
  "B+",
  "B",
  "C+",
  "C",
  "D+",
  "D"
];

function AcademicRecord() {
  const currentUser = getCurrentUser();

  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [groupedByTerm, setGroupedByTerm] = useState({});

  const [gpa, setGpa] = useState(0);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [passedCoursesCount, setPassedCoursesCount] = useState(0);
  const [failedCoursesCount, setFailedCoursesCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecord = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyRecord();

        setStudent(data.student || null);

        const normalizedRecords =
          (data.records || []).map((record) => ({
            id: record._id || record.id,

            term: record.term,

            course:
              record.courseId ||
              record.course,

            grade: record.grade,

            passed:
              PASSING_GRADES.includes(
                record.grade
              ),

            retakeRequired:
              record.retakeRequired === true
          }));

        setRecords(normalizedRecords);

        const groups = {};

        normalizedRecords.forEach((record) => {
          if (!groups[record.term]) {
            groups[record.term] = [];
          }

          groups[record.term].push(record);
        });

        setGroupedByTerm(groups);

        const summary =
          data.academicSummary || {};

        setGpa(
          summary.gpa ?? 0
        );

        setTotalCreditsEarned(
          summary.totalCredits ?? 0
        );

        setPassedCoursesCount(
          summary.passedCourses ?? 0
        );

        setFailedCoursesCount(
          summary.failedCourses ?? 0
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

  const failedCourses = records.filter(
    (record) => record.retakeRequired
  );

  const termEntries =
    Object.entries(
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
                  <p>GPA</p>

                  <h2>
                    {gpa.toFixed(2)}
                  </h2>

                  <span>
                    Cumulative GPA
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
                  📚
                </div>

                <div>
                  <p>
                    Courses Passed
                  </p>

                  <h2>
                    {passedCoursesCount}
                  </h2>

                  <span>
                    completed courses
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
                    {failedCoursesCount}
                  </h2>

                  <span>
                    unresolved failed courses
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
                                  {record.course?.code ||
                                    "N/A"}
                                </strong>

                                <span>
                                  {record.course?.title ||
                                    "Unknown Course"}
                                </span>

                                <span>
                                  {record.course?.credits ||
                                    0}
                                </span>

                                <strong
                                  className={
                                    record.grade === "F"
                                      ? "grade-fail"
                                      : ""
                                  }
                                >
                                  {record.grade}
                                </strong>

                                <span>
                                  {record.retakeRequired ? (
                                    <span className="retake-badge">
                                      Retake Required
                                    </span>
                                  ) : record.passed ? (
                                    "Passed"
                                  ) : (
                                    "Not completed"
                                  )}
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