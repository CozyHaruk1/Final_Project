import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function AcademicRecord() {
  const records = [
    {
      term: "2025-3",
      courses: [
        {
          code: "CSC210",
          title: "Data Structures",
          credits: 4,
          grade: "F"
        },
        {
          code: "ITE220",
          title: "Database Management Systems I",
          credits: 4,
          grade: "B+"
        },
        {
          code: "MAT210",
          title: "Discrete Mathematics",
          credits: 4,
          grade: "B"
        }
      ]
    },
    {
      term: "2025-2",
      courses: [
        {
          code: "CSC120",
          title: "Programming I",
          credits: 4,
          grade: "A"
        },
        {
          code: "ITE210",
          title: "Computer Networks",
          credits: 4,
          grade: "C+"
        },
        {
          code: "GEN101",
          title: "Academic English",
          credits: 4,
          grade: "B"
        }
      ]
    },
    {
      term: "2025-1",
      courses: [
        {
          code: "CSC110",
          title: "Introduction to Computing",
          credits: 4,
          grade: "A"
        },
        {
          code: "MAT110",
          title: "College Mathematics",
          credits: 4,
          grade: "B+"
        }
      ]
    }
  ];

  const gradePoints = {
    A: 4,
    "B+": 3.5,
    B: 3,
    "C+": 2.5,
    C: 2,
    "D+": 1.5,
    D: 1,
    F: 0
  };

  const allCourses = records.flatMap(
    (record) => record.courses
  );

  const passedCourses = allCourses.filter(
    (course) => course.grade !== "F"
  );

  const completedCredits = passedCourses.reduce(
    (total, course) => total + course.credits,
    0
  );

  const totalGradePoints = allCourses.reduce(
    (total, course) =>
      total +
      gradePoints[course.grade] * course.credits,
    0
  );

  const attemptedCredits = allCourses.reduce(
    (total, course) => total + course.credits,
    0
  );

  const gpa =
    attemptedCredits > 0
      ? (totalGradePoints / attemptedCredits).toFixed(2)
      : "0.00";

  const failedCourses = allCourses.filter(
    (course) => course.grade === "F"
  );

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="Academic Record"
          name="Student"
          role="Student"
        />

        <div className="cards">
          <div className="card">
            <div className="card-icon blue">
              🎓
            </div>

            <div>
              <p>Credits Earned</p>
              <h2>{completedCredits}</h2>
              <span>of 160 required</span>
            </div>
          </div>

          <div className="card">
            <div className="card-icon green">
              📈
            </div>

            <div>
              <p>GPA</p>
              <h2>{gpa}</h2>
              <span>Cumulative GPA</span>
            </div>
          </div>

          <div className="card">
            <div className="card-icon orange">
              📚
            </div>

            <div>
              <p>Completed Courses</p>
              <h2>{passedCourses.length}</h2>
              <span>Passed courses</span>
            </div>
          </div>

          <div className="card">
            <div className="card-icon purple">
              ⚠️
            </div>

            <div>
              <p>Retakes Required</p>
              <h2>{failedCourses.length}</h2>
              <span>Failed courses</span>
            </div>
          </div>
        </div>

        {failedCourses.length > 0 && (
          <section className="panel retake-panel">
            <div className="panel-header">
              <div>
                <h2>Retake Required</h2>
                <p>
                  These courses must be completed again.
                </p>
              </div>
            </div>

            {failedCourses.map((course) => (
              <div
                className="retake-course"
                key={course.code}
              >
                <div>
                  <strong>
                    {course.code} — {course.title}
                  </strong>

                  <p>
                    Previous grade: {course.grade}
                  </p>
                </div>

                <span className="retake-badge">
                  Retake Required
                </span>
              </div>
            ))}
          </section>
        )}

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Course History</h2>
              <p>
                Completed and attempted courses by term
              </p>
            </div>
          </div>

          <div className="record-terms">
            {records.map((record) => (
              <div
                className="record-term"
                key={record.term}
              >
                <h3>
                  Term {record.term}
                </h3>

                <div className="record-table">
                  <div className="record-row record-heading">
                    <span>Course</span>
                    <span>Title</span>
                    <span>Credits</span>
                    <span>Grade</span>
                    <span>Status</span>
                  </div>

                  {record.courses.map((course) => (
                    <div
                      className="record-row"
                      key={course.code}
                    >
                      <strong>{course.code}</strong>

                      <span>{course.title}</span>

                      <span>{course.credits}</span>

                      <strong
                        className={
                          course.grade === "F"
                            ? "grade-fail"
                            : ""
                        }
                      >
                        {course.grade}
                      </strong>

                      <span>
                        {course.grade === "F" ? (
                          <span className="retake-badge">
                            Retake Required
                          </span>
                        ) : (
                          <span className="status add-drop-open">
                            Passed
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AcademicRecord;