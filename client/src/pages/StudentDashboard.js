import React from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";

const h = React.createElement;

function StudentDashboard() {
  // Temporary demo data.
  // Later this will come from api.js / MongoDB.
  const student = {
    name: "Student",
    role: "Student",
    currentCredits: 12,
    completedCredits: 88,
    registeredCourses: 3,
    requiredCredits: 160
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
      closingDate: "30 Sep 2026"
    },

    {
      id: 2,
      code: "ITE321",
      title:
        "Systems Analysis, Design & Implementation",
      section: "02",
      day: "Wednesday",
      time: "10:30 - 12:30",
      room: "A204",
      instructor: "Prof. Lee",
      credits: 4,
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
      room: "C105",
      instructor: "Dr. Taylor",
      credits: 4,
      addDropOpen: true,
      closingDate: "30 Sep 2026"
    }
  ];

  const failedCourses = [
    {
      code: "CSC210",
      title: "Data Structures",
      grade: "F"
    }
  ];

  const progressPercentage = Math.round(
    (
      student.completedCredits /
      student.requiredCredits
    ) * 100
  );

  const remainingCredits =
    student.requiredCredits -
    student.completedCredits;

  const availableCredits =
    16 - student.currentCredits;

  const currentCourseElements =
    currentCourses.map((course) =>
      h(
        "div",
        {
          className: "course",
          key: course.id
        },

        h(
          "div",
          { className: "course-code" },

          h(
            "strong",
            null,
            course.code
          ),

          h(
            "span",
            null,
            `Sec ${course.section}`
          )
        ),

        h(
          "div",
          { className: "course-info" },

          h(
            "h3",
            null,
            course.title
          ),

          h(
            "p",
            null,
            `${course.day} · ${course.time}`
          ),

          h(
            "p",
            null,
            `${course.room} · ${course.instructor}`
          )
        ),

        h(
          "div",
          { className: "course-credit" },

          h(
            "strong",
            null,
            course.credits
          ),

          h(
            "small",
            null,
            "Credits"
          )
        ),

        h(
          "span",
          {
            className:
              course.addDropOpen
                ? "status add-drop-open"
                : "status add-drop-closed"
          },

          course.addDropOpen
            ? "Add/Drop Open"
            : "Add/Drop Closed"
        )
      )
    );

  const addDropElements =
    currentCourses.map((course) =>
      h(
        "div",
        {
          className: "add-drop-item",
          key: course.id
        },

        h(
          "div",
          null,

          h(
            "strong",
            null,
            `${course.code} - Section ${course.section}`
          ),

          course.addDropOpen
            ? h(
                "p",
                null,
                `Open until ${course.closingDate}`
              )
            : h(
                "p",
                null,
                "Add/drop window is closed"
              )
        ),

        course.addDropOpen
          ? h(
              "button",
              {
                className: "request-btn"
              },
              "Request"
            )
          : h(
              "span",
              {
                className: "closed-label"
              },
              "Closed"
            )
      )
    );

  const failedCourseElements =
    failedCourses.map((course) =>
      h(
        "div",
        {
          className: "retake-course",
          key: course.code
        },

        h(
          "div",
          null,

          h(
            "strong",
            null,
            `${course.code} - ${course.title}`
          ),

          h(
            "p",
            null,
            `Previous grade: ${course.grade}`
          )
        ),

        h(
          "span",
          {
            className: "retake-badge"
          },
          "Retake Required"
        )
      )
    );

  return h(
    "div",
    {
      className: "student-layout"
    },

    h(Sidebar),

    h(
      "main",
      {
        className: "main"
      },

      h(Header, {
        name: student.name,
        role: student.role
      }),

      h(
        "section",
        {
          className: "cards"
        },

        h(StatCard, {
          icon: "📚",
          title: "Current Credits",
          value: `${student.currentCredits} / 16`,
          subtitle:
            `${availableCredits} credits available`,
          type: "blue"
        }),

        h(StatCard, {
          icon: "✓",
          title: "Completed Credits",
          value: student.completedCredits,
          subtitle:
            `of ${student.requiredCredits} required`,
          type: "green"
        }),

        h(StatCard, {
          icon: "📖",
          title: "Registered Courses",
          value: student.registeredCourses,
          subtitle: "This semester",
          type: "orange"
        }),

        h(StatCard, {
          icon: "🎓",
          title: "Progress",
          value: `${progressPercentage}%`,
          subtitle: "Degree completion",
          type: "purple"
        })
      ),

      h(
        "section",
        {
          className: "content-grid"
        },

        h(
          "div",
          {
            className:
              "panel courses-panel"
          },

          h(
            "div",
            {
              className: "panel-header"
            },

            h(
              "div",
              null,

              h(
                "h2",
                null,
                "Current Courses"
              ),

              h(
                "p",
                null,
                "Courses registered for the current semester"
              )
            ),

            h(
              "button",
              {
                className: "outline-btn"
              },
              "View All"
            )
          ),

          h(
            "div",
            {
              className: "current-courses"
            },
            currentCourseElements
          )
        ),

        h(
          "div",
          {
            className:
              "panel add-drop-panel"
          },

          h(
            "div",
            {
              className: "panel-header"
            },

            h(
              "div",
              null,

              h(
                "h2",
                null,
                "Add / Drop Status"
              ),

              h(
                "p",
                null,
                "Courses currently available for change requests"
              )
            )
          ),

          h(
            "div",
            {
              className: "add-drop-list"
            },
            addDropElements
          )
        )
      ),

      failedCourses.length > 0
        ? h(
            "section",
            {
              className:
                "panel retake-panel"
            },

            h(
              "div",
              {
                className: "panel-header"
              },

              h(
                "div",
                null,

                h(
                  "h2",
                  null,
                  "Retake Required"
                ),

                h(
                  "p",
                  null,
                  "Courses with a grade of F must be retaken"
                )
              )
            ),

            failedCourseElements
          )
        : null,

      h(
        "section",
        {
          className:
            "panel progress-panel"
        },

        h(
          "div",
          {
            className: "panel-header"
          },

          h(
            "div",
            null,

            h(
              "h2",
              null,
              "Academic Progress"
            ),

            h(
              "p",
              null,
              "Degree completion overview"
            )
          ),

          h(
            "span",
            {
              className: "graduation"
            },
            `🎓 ${remainingCredits} Credits Remaining`
          )
        ),

        h(
          "div",
          {
            className:
              "progress-container"
          },

          h(
            "div",
            {
              className:
                "progress-label"
            },

            h(
              "span",
              null,
              "Completed Credits"
            ),

            h(
              "strong",
              null,
              `${student.completedCredits} / ${student.requiredCredits}`
            )
          ),

          h(
            "div",
            {
              className: "progress-bar"
            },

            h("div", {
              className: "progress-fill",
              style: {
                width:
                  `${progressPercentage}%`
              }
            })
          )
        )
      )
    )
  );
}

export default StudentDashboard;