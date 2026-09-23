import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MyCourses() {
  const courses = [
    {
      id: 1,
      code: "CSC220",
      title: "Web Development II",
      section: "01",
      credits: 4,
      day: "Monday",
      startTime: "08:30",
      endTime: "10:30",
      room: "B302",
      instructor: "Dr. Smith",
      addDropOpen: true,
      closingDate: "30 Sep 2026"
    },
    {
      id: 2,
      code: "ITE321",
      title: "Systems Analysis, Design & Implementation",
      section: "02",
      credits: 4,
      day: "Wednesday",
      startTime: "10:30",
      endTime: "12:30",
      room: "A204",
      instructor: "Prof. Lee",
      addDropOpen: false,
      closingDate: null
    },
    {
      id: 3,
      code: "ITE420",
      title: "Information Security",
      section: "01",
      credits: 4,
      day: "Friday",
      startTime: "13:00",
      endTime: "15:00",
      room: "C105",
      instructor: "Dr. Taylor",
      addDropOpen: true,
      closingDate: "30 Sep 2026"
    }
  ];

  const totalCredits = courses.reduce(
    (total, course) => total + course.credits,
    0
  );

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="My Courses"
          name="Student"
          role="Student"
        />

        <div className="courses-summary">
          <p>Courses registered for the current semester</p>

          <span className="credit-summary">
            {totalCredits} / 16 Credits
          </span>
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Current Registration</h2>
              <p>{courses.length} courses registered</p>
            </div>
          </div>

          <div className="my-courses-list">
            {courses.map((course) => (
              <div
                className="my-course-card"
                key={course.id}
              >
                <div className="my-course-header">
                  <div>
                    <span className="course-code-label">
                      {course.code}
                    </span>

                    <h3>{course.title}</h3>
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

                <div className="course-details-grid">
                  <div>
                    <span>Section</span>
                    <strong>{course.section}</strong>
                  </div>

                  <div>
                    <span>Credits</span>
                    <strong>{course.credits}</strong>
                  </div>

                  <div>
                    <span>Day</span>
                    <strong>{course.day}</strong>
                  </div>

                  <div>
                    <span>Time</span>
                    <strong>
                      {course.startTime} - {course.endTime}
                    </strong>
                  </div>

                  <div>
                    <span>Room</span>
                    <strong>{course.room}</strong>
                  </div>

                  <div>
                    <span>Instructor</span>
                    <strong>{course.instructor}</strong>
                  </div>
                </div>

                {course.addDropOpen && (
                  <div className="my-course-footer">
                    <p>
                      Add/drop requests close on{" "}
                      <strong>
                        {course.closingDate}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MyCourses;