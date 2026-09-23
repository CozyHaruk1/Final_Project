import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/login";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function AdminPlaceholder() {
  return React.createElement(
    "h1",
    null,
    "Admin Dashboard"
  );
}

function AdvisorPlaceholder() {
  return React.createElement(
    "h1",
    null,
    "Advisor Dashboard"
  );
}

function App() {
  return React.createElement(
    BrowserRouter,
    null,

    React.createElement(
      Routes,
      null,

      React.createElement(Route, {
        path: "/login",
        element: React.createElement(Login)
      }),

      React.createElement(Route, {
        path: "/student",
        element: React.createElement(
          ProtectedRoute,
          {
            allowedRoles: ["student"]
          },
          React.createElement(StudentDashboard)
        )
      }),

      React.createElement(Route, {
        path: "/admin",
        element: React.createElement(
          ProtectedRoute,
          {
            allowedRoles: ["admin"]
          },
          React.createElement(AdminPlaceholder)
        )
      }),

      React.createElement(Route, {
        path: "/advisor",
        element: React.createElement(
          ProtectedRoute,
          {
            allowedRoles: ["advisor"]
          },
          React.createElement(AdvisorPlaceholder)
        )
      }),

      React.createElement(Route, {
        path: "/",
        element: React.createElement(Navigate, {
          to: "/login",
          replace: true
        })
      }),

      React.createElement(Route, {
        path: "*",
        element: React.createElement(Navigate, {
          to: "/login",
          replace: true
        })
      })
    )
  );
}

export default App;