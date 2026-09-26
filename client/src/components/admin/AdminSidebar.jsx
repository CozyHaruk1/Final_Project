import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../services/api";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          <img src="/university-logo.png" alt="University logo" />
        </div>

        <div className="logo-text">
          <h2>CourseReg</h2>
          <p>Admin Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">

        <NavLink to="/admin" end className={linkClass}>
          <LayoutDashboard className="sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" end className={linkClass}>
          <Users className="sidebar-icon" />
          <span>User Management</span>
        </NavLink>

        <NavLink to="/admin/users/new" className={linkClass}>
          <UserPlus className="sidebar-icon" />
          <span>Create User</span>
        </NavLink>

      </nav>

      <div className="sidebar-bottom">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut className="sidebar-icon" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

export default AdminSidebar;