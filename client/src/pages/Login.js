import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

const h = React.createElement;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      if (!data.token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const role = data.user?.role || data.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "advisor") {
        navigate("/advisor");
      } else if (role === "student") {
        navigate("/student");
      } else {
        setError("Unknown user role.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return h(
    "div",
    { className: "login-page" },

    h(
      "div",
      { className: "login-card" },

      h("h1", null, "Course Registration System"),

      h(
        "p",
        null,
        "Sign in using your university account."
      ),

      h(
        "form",
        { onSubmit: handleSubmit },

        h(
          "div",
          { className: "form-group" },

          h("label", null, "Email"),

          h("input", {
            type: "email",
            value: email,
            onChange: (event) => setEmail(event.target.value),
            placeholder: "student@example.com",
            required: true
          })
        ),

        h(
          "div",
          { className: "form-group" },

          h("label", null, "Password"),

          h("input", {
            type: "password",
            value: password,
            onChange: (event) => setPassword(event.target.value),
            placeholder: "Enter your password",
            required: true
          })
        ),

        error
          ? h(
              "p",
              { className: "login-error" },
              error
            )
          : null,

        h(
          "button",
          {
            type: "submit",
            disabled: loading
          },
          loading ? "Signing in..." : "Log In"
        )
      )
    )
  );
}

export default Login;