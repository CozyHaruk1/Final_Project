import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";

function StudentDashboard() {
  // Temporary demo data.
  // Later we will replace this with data from api.js / MongoDB.
  const student = {
    name: "Student",
    role: "Student",
    currentCredits: 12,
    completedCredits: 88,
    registeredCourses: 3,
    requiredCredits: 160,
  };

  const currentCourses = [
    {
      id: 1,
      code: "CSC220",
      title: "Web Development II",
      section: "01",
      day: "Monday",
      time: "08:30 - 10:30",
      room: "B302",
      instructor: "Dr. Smith",
      credits: 4,
      addDropOpen: true,
      closingDate: "30 Sep 2026",
    },
    {
      id: 2,
      code: "ITE321",
      title: "Systems Analysis, Design & Implementation",
      section: "02",
      day: "Wednesday",
      time: "10:30 - 12:30",
      room: "A204",
      instructor: "Prof. Lee",
      credits: 4,
      addDropOpen: false,
      closingDate: null,
    },
    {
      id: 3,
      code: "ITE420",
      title: "Information Security",
      section: "01",
      day: "Friday",
      time: "13:00 - 15:00",
      room: "C105",
      instructor: "Dr. Taylor",
      credits: 4,
      addDropOpen: true,
      closingDate: "30 Sep 2026",
    },
  ];

  const failedCourses = [
    {
      code: "CSC210",
      title: "Data Structures",
      grade: "F",
    },
  ];

  const progressPercentage = Math.round(
    (student.completedCredits / student.requiredCredits) * 100
  );

  const remainingCredits =
    student.requiredCredits - student.completedCredits;

  const availableCredits = 16 - student.currentCredits;

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header name={student.name} role={student.role} />

        {/* Summary Cards */}
        <section className="cards">
          <StatCard
            icon="📚"
            title="Current Credits"
            value={`${student.currentCredits} / 16`}
            subtitle={`${availableCredits} credits available`}
            type="blue"
          />

          <StatCard
            icon="✓"
            title="Completed Credits"
            value={student.completedCredits}
            subtitle={`of ${student.requiredCredits} required`}
            type="green"
          />

          <StatCard
            icon="📖"
            title="Registered Courses"
            value={student.registeredCourses}
            subtitle="This semester"
            type="orange"
          />

          <StatCard
            icon="🎓"
            title="Progress"
            value={`${progressPercentage}%`}
            subtitle="Degree completion"
            type="purple"
          />
        </section>

        {/* Main Dashboard Content */}
        <section className="content-grid">
          {/* Current Courses */}
          <div className="panel courses-panel">
            <div className="panel-header">
              <div>
                <h2>Current Courses</h2>
                <p>Courses registered for the current semester</p>
              </div>

              <button className="outline-btn">
                View All
              </button>
            </div>

            <div className="current-courses">
              {currentCourses.map((course) => (
                <div className="course" key={course.id}>
                  <div className="course-code">
                    <strong>{course.code}</strong>
                    <span>Sec {course.section}</span>
                  </div>

                  <div className="course-info">
                    <h3>{course.title}</h3>

                    <p>
                      {course.day} · {course.time}
                    </p>

                    <p>
                      {course.room} · {course.instructor}
                    </p>
                  </div>

                  <div className="course-credit">
                    <strong>{course.credits}</strong>
                    <small>Credits</small>
                  </div>

                  <span
                    className={
                      course.addDropOpen
                        ? "status add-drop-open"
                        : "status add-drop-closed"
                    }
                  >
                    {course.addDropOpen
                      ? "Add/Drop Open"
                      : "Add/Drop Closed"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add / Drop Status */}
          <div className="panel add-drop-panel">
            <div className="panel-header">
              <div>
                <h2>Add / Drop Status</h2>
                <p>Courses currently available for change requests</p>
              </div>
            </div>

            <div className="add-drop-list">
              {currentCourses.map((course) => (
                <div className="add-drop-item" key={course.id}>
                  <div>
                    <strong>
                      {course.code} - Section {course.section}
                    </strong>

                    {course.addDropOpen ? (
                      <p>
                        Open until {course.closingDate}
                      </p>
                    ) : (
                      <p>Add/drop window is closed</p>
                    )}
                  </div>

                  {course.addDropOpen ? (
                    <button className="request-btn">
                      Request
                    </button>
                  ) : (
                    <span className="closed-label">
                      Closed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Retake Alert */}
        {failedCourses.length > 0 && (
          <section className="panel retake-panel">
            <div className="panel-header">
              <div>
                <h2>Retake Required</h2>
                <p>
                  Courses with a grade of F must be retaken
                </p>
              </div>
            </div>

            {failedCourses.map((course) => (
              <div className="retake-course" key={course.code}>
                <div>
                  <strong>
                    {course.code} - {course.title}
                  </strong>

                  <p>Previous grade: {course.grade}</p>
                </div>

                <span className="retake-badge">
                  Retake Required
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Academic Progress */}
        <section className="panel progress-panel">
          <div className="panel-header">
            <div>
              <h2>Academic Progress</h2>
              <p>Degree completion overview</p>
            </div>

            <span className="graduation">
              🎓 {remainingCredits} Credits Remaining
            </span>
          </div>

          <div className="progress-container">
            <div className="progress-label">
              <span>Completed Credits</span>

              <strong>
                {student.completedCredits} / {student.requiredCredits}
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progressPercentage}%`,
                }}
              ></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;