import React from "react";

const h = React.createElement;

function StatCard({
  icon,
  title,
  value,
  subtitle,
  type = ""
}) {
  return h(
    "div",
    { className: "card" },

    h(
      "div",
      {
        className: `card-icon ${type}`
      },
      icon
    ),

    h(
      "div",
      null,

      h("p", null, title),

      h("h2", null, value),

      h(
        "span",
        {
          className:
            type === "green"
              ? "positive"
              : ""
        },
        subtitle
      )
    )
  );
}

export default StatCard;