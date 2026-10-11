import {
  LayoutDashboard,
  BookOpen,
  Search,
  FilePenLine,
  LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../services/api";

function AdvisorSidebar() {
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
          <p>Advisor Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">

        <NavLink to="/advisor" end className={linkClass}>
          <LayoutDashboard className="sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/advisor/offerings" end className={linkClass}>
          <BookOpen className="sidebar-icon" />
          <span>Manage Offerings</span>
        </NavLink>

        <NavLink to="/advisor/registration" className={linkClass}>
          <Search className="sidebar-icon" />
          <span>Student Registration</span>
        </NavLink>

        <NavLink to="/advisor/add-drop" className={linkClass}>
          <FilePenLine className="sidebar-icon" />
          <span>Add / Drop</span>
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

export default AdvisorSidebar;