import React from "react";

const h = React.createElement;

function Header({
  name = "Student",
  role = "Student"
}) {
  const initial = name
    ? name.charAt(0).toUpperCase()
    : "S";

  return h(
    "header",
    { className: "header" },

    h(
      "div",
      { className: "header-left" },

      h("h1", null, "Dashboard"),

      h(
        "p",
        null,
        "Welcome back, ",
        h("span", null, name),
        " 👋"
      )
    ),

    h(
      "div",
      { className: "profile" },

      h(
        "div",
        { className: "notification" },
        "🔔"
      ),

      h(
        "div",
        { className: "avatar" },
        initial
      ),

      h(
        "div",
        { className: "profile-info" },

        h("strong", null, name),

        h("small", null, role)
      )
    )
  );
}

export default Header;