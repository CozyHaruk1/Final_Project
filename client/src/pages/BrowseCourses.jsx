import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import {
  getCurrentUser,
  getOfferings
} from "../services/api";

function BrowseCourses() {
  const user = getCurrentUser();

  const [offerings, setOfferings] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentTerm = "2026-1";

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOfferings(
          currentTerm
        );

        setOfferings(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setError(
          err.message ||
          "Could not load course offerings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOfferings();
  }, []);

  const getDepartment = (code = "") => {
    const match = code.match(/^[A-Za-z]+/);

    return match
      ? match[0].toUpperCase()
      : "OTHER";
  };

  const departments = useMemo(() => {
    const values = offerings
      .map((offering) =>
        getDepartment(
          offering.courseId?.code
        )
      )
      .filter(Boolean);

    return [
      ...new Set(values)
    ].sort();
  }, [offerings]);

  const filteredOfferings = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return offerings.filter(
      (offering) => {
        const course =
          offering.courseId;

        if (!course) {
          return false;
        }

        const courseDepartment =
          getDepartment(course.code);

        const matchesDepartment =
          department === "all" ||
          courseDepartment === department;

        const matchesSearch =
          query === "" ||
          course.code
            ?.toLowerCase()
            .includes(query) ||
          course.title
            ?.toLowerCase()
            .includes(query) ||
          offering.instructor
            ?.toLowerCase()
            .includes(query);

        return (
          matchesDepartment &&
          matchesSearch
        );
      }
    );
  }, [
    offerings,
    search,
    department
  ]);

  return (
    <div className="student-layout">
      <Sidebar />

      <main className="main">
        <Header
          title="Browse Courses"
          name={
            user?.name ||
            "Student"
          }
          role="Student"
        />

        <div className="browse-intro">
          <h2>
            Course Offerings
          </h2>

          <p>
            Browse available course sections
            for term {currentTerm}.
          </p>
        </div>

        <section className="panel browse-filter-panel">
          <div className="browse-filters">

            <div className="browse-search">
              <label>
                Search Courses
              </label>

              <input
                type="text"
                placeholder="Search by course code, title or instructor..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="browse-department">
              <label>
                Department
              </label>

              <select
                value={department}
                onChange={(event) =>
                  setDepartment(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  All Departments
                </option>

                {departments.map(
                  (value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  )
                )}
              </select>
            </div>

          </div>
        </section>

        {loading && (
          <Loading
            message="Loading course offerings..."
          />
        )}

        {error && (
          <ErrorMessage
            message={error}
          />
        )}

        {!loading &&
          !error &&
          filteredOfferings.length === 0 && (
            <section className="panel">
              <div className="browse-empty">
                <h3>
                  No courses found
                </h3>

                <p>
                  Try changing your search
                  or department filter.
                </p>
              </div>
            </section>
          )}

        {!loading &&
          !error &&
          filteredOfferings.length > 0 && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>
                    Available Sections
                  </h2>

                  <p>
                    {
                      filteredOfferings.length
                    }
                    {" "}
                    section
                    {
                      filteredOfferings.length !== 1
                        ? "s"
                        : ""
                    }
                    {" "}
                    found
                  </p>
                </div>
              </div>

              <div className="browse-course-list">

                {filteredOfferings.map(
                  (offering) => {
                    const course =
                      offering.courseId;

                    if (!course) {
                      return null;
                    }

                    return (
                      <div
                        className={`browse-course-card ${
                          offering.full
                            ? "browse-course-disabled"
                            : ""
                        }`}
                        key={offering._id}
                      >

                        <div className="browse-course-top">

                          <div>
                            <div className="browse-course-title">
                              <span className="course-code-label">
                                {course.code}
                              </span>

                              <h3>
                                {course.title}
                              </h3>
                            </div>

                            <p>
                              Section{" "}
                              {offering.section}
                              {" • "}
                              Term{" "}
                              {offering.term}
                            </p>
                          </div>

                          <span
                            className={`course-availability ${
                              offering.full
                                ? "full"
                                : "available"
                            }`}
                          >
                            {offering.full
                              ? "Full"
                              : `${offering.seatsRemaining} Seats Available`}
                          </span>

                        </div>

                        <div className="browse-course-details">

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
                              Schedule
                            </span>

                            <strong>
                              {offering.day}
                              {" "}
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
                              {offering.room ||
                                "TBA"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Instructor
                            </span>

                            <strong>
                              {offering.instructor ||
                                "TBA"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Seats
                            </span>

                            <strong>
                              {offering.seatsTaken}
                              {" / "}
                              {offering.seats}
                            </strong>
                          </div>

                        </div>

                        {course.prerequisites &&
                          course.prerequisites.length > 0 && (
                            <div className="course-exclusion-reason">
                              <strong>
                                Prerequisites:
                              </strong>
                              {" "}
                              {course.prerequisites.join(
                                ", "
                              )}
                            </div>
                          )}

                        {offering.addDropOpen && (
                          <div className="browse-add-drop-note">
                            Add/Drop is currently open
                            {offering.addDropCloseDate
                              ? ` until ${new Date(
                                  offering.addDropCloseDate
                                ).toLocaleDateString()}`
                              : ""}
                            .
                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            </section>
          )}
      </main>
    </div>
  );
}

export default BrowseCourses;