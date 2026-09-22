import React from "react";
import {
  NavLink,
  useNavigate
} from "react-router-dom";

const h = React.createElement;

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const linkClass = ({ isActive }) => {
    return isActive
      ? "sidebar-link active"
      : "sidebar-link";
  };

  return h(
    "aside",
    { className: "sidebar" },

    h(
      "div",
      { className: "logo" },

      h(
        "div",
        { className: "logo-icon" },
        "CR"
      ),

      h(
        "div",
        { className: "logo-text" },

        h("h2", null, "CourseReg"),

        h("p", null, "Student Portal")
      )
    ),

    h(
      "nav",
      { className: "sidebar-nav" },

      h(
        NavLink,
        {
          to: "/student",
          className: linkClass
        },

        h(
          "span",
          { className: "sidebar-icon" },
          "⌂"
        ),

        h("span", null, "Dashboard")
      ),

      h(
        NavLink,
        {
          to: "/student/courses",
          className: linkClass
        },

        h(
          "span",
          { className: "sidebar-icon" },
          "📚"
        ),

        h("span", null, "My Courses")
      ),

      h(
        NavLink,
        {
          to: "/student/record",
          className: linkClass
        },

        h(
          "span",
          { className: "sidebar-icon" },
          "📊"
        ),

        h("span", null, "Academic Record")
      ),

      h(
        NavLink,
        {
          to: "/student/add-drop",
          className: linkClass
        },

        h(
          "span",
          { className: "sidebar-icon" },
          "📝"
        ),

        h("span", null, "Add / Drop")
      ),

      h(
        NavLink,
        {
          to: "/student/browse",
          className: linkClass
        },

        h(
          "span",
          { className: "sidebar-icon" },
          "🔎"
        ),

        h("span", null, "Browse Courses")
      )
    ),

    h(
      "div",
      { className: "sidebar-bottom" },

      h(
        "button",
        {
          className: "logout-button",
          onClick: handleLogout
        },

        h(
          "span",
          { className: "sidebar-icon" },
          "↪"
        ),

        h("span", null, "Logout")
      )
    )
  );
}

export default Sidebar;