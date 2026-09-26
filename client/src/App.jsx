import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import MyCourses from "./pages/MyCourses";
import AcademicRecord from "./pages/AcademicRecord";
import AddDrop from "./pages/AddDrop";
import BrowseCourses from "./pages/BrowseCourses";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/UserManagement";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";


function AdminPlaceholder() {
  return <h1>Admin Dashboard</h1>;
}


function AdvisorPlaceholder() {
  return <h1>Advisor Dashboard</h1>;
}


function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/student"
        element={
          <Navigate
            to="/student/dashboard"
            replace
          />
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/record"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <AcademicRecord />
        </ProtectedRoute>
        }
      />

      <Route
        path="/student/courses"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/add-drop"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <AddDrop />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/browse"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <BrowseCourses />
          </ProtectedRoute>
        }
      /> 

            <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
            <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateUser />
          </ProtectedRoute>
        }
      />
            <Route
        path="/admin/users/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor"
        element={
          <ProtectedRoute allowedRoles={["advisor"]}>
            <AdvisorPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;