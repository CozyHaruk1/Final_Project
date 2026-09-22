import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove login information
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Return to login page
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">CR</div>

        <div className="logo-text">
          <h2>CourseReg</h2>
          <p>Student Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink
          to="/student/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">⌂</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/student/courses"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">📚</span>
          <span>My Courses</span>
        </NavLink>

        <NavLink
          to="/student/record"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">📊</span>
          <span>Academic Record</span>
        </NavLink>

        <NavLink
          to="/student/add-drop"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">📝</span>
          <span>Add / Drop</span>
        </NavLink>

        <NavLink
          to="/student/browse"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">🔎</span>
          <span>Browse Courses</span>
        </NavLink>
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button className="logout-button" onClick={handleLogout}>
          <span className="sidebar-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;