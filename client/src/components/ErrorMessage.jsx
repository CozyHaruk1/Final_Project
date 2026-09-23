import React from "react";

const h = React.createElement;

function ErrorMessage({
  message = "Something went wrong."
}) {
  return h(
    "div",
    { className: "error-message" },

    h(
      "span",
      { className: "error-icon" },
      "!"
    ),

    h("p", null, message)
  );
}

export default ErrorMessage;