import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function BrowseCourses() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  // Temporary data until the offerings API is connected.
  const courses = [
    {
      id: 1,
      code: "CSC220",
      title: "Web Development II",
      department: "CSC",
      credits: 4,
      prerequisite: "None",
      section: "01",
      day: "Monday",
      time: "08:30 - 10:30",
      room: "B302",
      instructor: "Dr. Smith",
      seats: 30,
      seatsTaken: 18,
      status: "Available",
      reason: ""
    },
    {
      id: 2,
      code: "ITE321",
      title: "Systems Analysis, Design & Implementation",
      department: "ITE",
      credits: 4,
      prerequisite: "None",
      section: "02",
      day: "Wednesday",
      time: "10:30 - 12:30",
      room: "A204",
      instructor: "Prof. Lee",
      seats: 25,
      seatsTaken: 25,
      status: "Full",
      reason: "Full — 0 seats remaining"
    },
    {
      id: 3,
      code: "ITE420",
      title: "Information Security",
      department: "ITE",
      credits: 4,
      prerequisite: "None",
      section: "01",
      day: "Friday",
      time: "13:00 - 15:00",
      room: "C105",
      instructor: "Dr. Taylor",
      seats: 30,
      seatsTaken: 21,
      status: "Available",
      reason: ""
    },
    {
      id: 4,
      code: "CSC310",
      title: "Advanced Web Development",
      department: "CSC",
      credits: 4,
      prerequisite: "CSC220",
      section: "01",
      day: "Tuesday",
      time: "13:00 - 15:00",
      room: "B305",
      instructor: "Dr. Wilson",
      seats: 30,
      seatsTaken: 12,
      status: "Not Eligible",
      reason: "Prerequisite CSC220 not completed"
    }
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.code
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      course.title
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesDepartment =
      department === "All" ||
      course.department === department;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="Browse Courses"
          name="Student"
          role="Student"
        />

        <div className="browse-intro">
          <div>
            <h2>Current Course Offerings</h2>

            <p>
              View courses and sections available for the
              current term.
            </p>
          </div>
        </div>

        <section className="panel browse-filter-panel">
          <div className="browse-filters">
            <div className="browse-search">
              <label>Search Courses</label>

              <input
                type="text"
                placeholder="Search by course code or title..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="browse-department">
              <label>Department</label>

              <select
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value)
                }
              >
                <option value="All">
                  All Departments
                </option>

                <option value="CSC">
                  Computer Science
                </option>

                <option value="ITE">
                  Information Technology
                </option>
              </select>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Course Offerings</h2>

              <p>
                {filteredCourses.length} courses found
              </p>
            </div>
          </div>

          <div className="browse-course-list">
            {filteredCourses.map((course) => {
              const seatsRemaining =
                course.seats - course.seatsTaken;

              return (
                <div
                  className={`browse-course-card ${
                    course.status !== "Available"
                      ? "browse-course-disabled"
                      : ""
                  }`}
                  key={course.id}
                >
                  <div className="browse-course-top">
                    <div>
                      <div className="browse-course-title">
                        <span className="course-code-label">
                          {course.code}
                        </span>

                        <h3>{course.title}</h3>
                      </div>

                      <p>
                        Section {course.section}
                        {" • "}
                        {course.credits} Credits
                      </p>
                    </div>

                    <span
                      className={`course-availability ${
                        course.status === "Available"
                          ? "available"
                          : course.status === "Full"
                          ? "full"
                          : "not-eligible"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <div className="browse-course-details">
                    <div>
                      <span>Schedule</span>

                      <strong>
                        {course.day},{" "}
                        {course.time}
                      </strong>
                    </div>

                    <div>
                      <span>Room</span>

                      <strong>{course.room}</strong>
                    </div>

                    <div>
                      <span>Instructor</span>

                      <strong>
                        {course.instructor}
                      </strong>
                    </div>

                    <div>
                      <span>Prerequisite</span>

                      <strong>
                        {course.prerequisite}
                      </strong>
                    </div>

                    <div>
                      <span>Seats</span>

                      <strong>
                        {seatsRemaining} /{" "}
                        {course.seats} available
                      </strong>
                    </div>
                  </div>

                  {course.reason && (
                    <div className="course-exclusion-reason">
                      <strong>Unavailable:</strong>{" "}
                      {course.reason}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCourses.length === 0 && (
              <div className="browse-empty">
                <h3>No courses found</h3>

                <p>
                  Try changing your search or department
                  filter.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default BrowseCourses;