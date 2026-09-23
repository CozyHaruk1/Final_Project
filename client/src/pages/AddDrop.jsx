import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function AddDrop() {
  const advisor = {
    name: "Dr. Sarah Lee",
    email: "advisor@stamford.edu"
  };

  // Temporary data until we connect the backend.
  const courses = [
    {
      id: 1,
      code: "CSC220",
      title: "Web Development II",
      section: "01",
      day: "Monday",
      time: "08:30 - 10:30",
      addDropOpen: true,
      closingDate: "30 Sep 2026"
    },
    {
      id: 2,
      code: "ITE321",
      title: "Systems Analysis, Design & Implementation",
      section: "02",
      day: "Wednesday",
      time: "10:30 - 12:30",
      addDropOpen: false,
      closingDate: null
    },
    {
      id: 3,
      code: "ITE420",
      title: "Information Security",
      section: "01",
      day: "Friday",
      time: "13:00 - 15:00",
      addDropOpen: true,
      closingDate: "30 Sep 2026"
    }
  ];

  const studentId = "ST001";

  function getEmailLink(course) {
    const subject =
      `Add/Drop Request - ${studentId} - ${course.code}`;

    return (
      `mailto:${advisor.email}` +
      `?subject=${encodeURIComponent(subject)}`
    );
  }

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="Add / Drop"
          name="Student"
          role="Student"
        />

        <div className="add-drop-page-intro">
          <div>
            <h2>Add / Drop Requests</h2>

            <p>
              Check the status of your registered courses
              and request a change when the add/drop window
              is open.
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Registered Courses</h2>

              <p>
                Add/drop availability for the current term
              </p>
            </div>
          </div>

          <div className="add-drop-course-list">
            {courses.map((course) => (
              <div
                className="add-drop-course-card"
                key={course.id}
              >
                <div className="add-drop-course-info">
                  <div className="add-drop-course-code">
                    {course.code}
                  </div>

                  <div>
                    <h3>{course.title}</h3>

                    <p>
                      Section {course.section}
                      {" • "}
                      {course.day}
                      {" • "}
                      {course.time}
                    </p>

                    {course.addDropOpen && (
                      <small>
                        Request deadline:{" "}
                        {course.closingDate}
                      </small>
                    )}
                  </div>
                </div>

                <div className="add-drop-course-action">
                  <span
                    className={
                      course.addDropOpen
                        ? "status add-drop-open"
                        : "status add-drop-closed"
                    }
                  >
                    {course.addDropOpen
                      ? "Open"
                      : "Closed"}
                  </span>

                  {course.addDropOpen ? (
                    <a
                      className="request-btn"
                      href={getEmailLink(course)}
                    >
                      Request Add / Drop
                    </a>
                  ) : (
                    <button
                      className="request-btn disabled-request"
                      disabled
                    >
                      Requests Closed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel add-drop-instructions">
          <div className="panel-header">
            <div>
              <h2>How to Request Add / Drop</h2>

              <p>
                Follow these steps before contacting your
                advisor.
              </p>
            </div>
          </div>

          <div className="instruction-content">
            <div className="instruction-steps">
              <div className="instruction-step">
                <span>1</span>

                <p>
                  Download and open the Add/Drop Request
                  form.
                </p>
              </div>

              <div className="instruction-step">
                <span>2</span>

                <p>
                  Fill in your student ID, name, term,
                  course code and section.
                </p>
              </div>

              <div className="instruction-step">
                <span>3</span>

                <p>
                  State the reason for your request and
                  sign the form.
                </p>
              </div>

              <div className="instruction-step">
                <span>4</span>

                <p>
                  Email the completed form to your advisor
                  as an attachment.
                </p>
              </div>

              <div className="instruction-step">
                <span>5</span>

                <p>
                  Wait for your advisor to confirm the
                  change by email.
                </p>
              </div>
            </div>

            <div className="advisor-card">
              <h3>Your Advisor</h3>

              <div className="advisor-detail">
                <span>Name</span>
                <strong>{advisor.name}</strong>
              </div>

              <div className="advisor-detail">
                <span>Email</span>

                <a href={`mailto:${advisor.email}`}>
                  {advisor.email}
                </a>
              </div>

              <div className="advisor-detail">
                <span>Email Subject</span>

                <strong>
                  Add/Drop Request - Student ID -
                  Course Code
                </strong>
              </div>

              <a
                className="download-form-btn"
                href="/AddDropRequest.pdf"
                download
              >
                Download Add/Drop Form
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AddDrop;