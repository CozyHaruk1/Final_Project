import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive
      ? "sidebar-link active"
      : "sidebar-link";

  return (
    <aside className="sidebar">

      <div className="logo">
        <div className="logo-icon">
          CR
        </div>

        <div className="logo-text">
          <h2>CourseReg</h2>
          <p>Student Portal</p>
        </div>
      </div>


      <nav className="sidebar-nav">

        <NavLink
          to="/student/dashboard"
          end
          className={linkClass}
        >
          <span className="sidebar-icon">
            ⌂
          </span>

          <span>
            Dashboard
          </span>
        </NavLink>


        <NavLink
          to="/student/courses"
          className={linkClass}
        >
          <span className="sidebar-icon">
            📚
          </span>

          <span>
            My Courses
          </span>
        </NavLink>


        <NavLink
          to="/student/record"
          className={linkClass}
        >
          <span className="sidebar-icon">
            📊
          </span>

          <span>
            Academic Record
          </span>
        </NavLink>


        <NavLink
          to="/student/add-drop"
          className={linkClass}
        >
          <span className="sidebar-icon">
            📝
          </span>

          <span>
            Add / Drop
          </span>
        </NavLink>


        <NavLink
          to="/student/browse"
          className={linkClass}
        >
          <span className="sidebar-icon">
            🔎
          </span>

          <span>
            Browse Courses
          </span>
        </NavLink>

      </nav>


      <div className="sidebar-bottom">

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;