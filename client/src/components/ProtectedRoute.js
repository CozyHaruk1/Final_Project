import React from "react";
import { Navigate } from "react-router-dom";

import {
  getCurrentUser,
  getToken
} from "../services/api";

const h = React.createElement;

function ProtectedRoute({
  children,
  allowedRoles
}) {
  const token = getToken();
  const user = getCurrentUser();

  if (!token || !user) {
    return h(Navigate, {
      to: "/login",
      replace: true
    });
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return h(Navigate, {
      to: "/login",
      replace: true
    });
  }

  return children;
}

export default ProtectedRoute;