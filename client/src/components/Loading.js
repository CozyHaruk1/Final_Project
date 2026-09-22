import React from "react";

const h = React.createElement;

function Loading({
  message = "Loading..."
}) {
  return h(
    "div",
    { className: "loading-state" },

    h("div", {
      className: "loading-spinner"
    }),

    h("p", null, message)
  );
}

export default Loading;