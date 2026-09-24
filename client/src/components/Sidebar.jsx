import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  FilePenLine,
  Search,
  LogOut
} from "lucide-react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

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
    <img
      src="/university-logo.png"
      alt="University logo"
    />
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
          <LayoutDashboard
            className="sidebar-icon"
          />

          <span>
            Dashboard
          </span>
        </NavLink>


        <NavLink
          to="/student/courses"
          className={linkClass}
        >
          <BookOpen
            className="sidebar-icon"
          />

          <span>
            My Courses
          </span>
        </NavLink>


        <NavLink
          to="/student/record"
          className={linkClass}
        >
          <BarChart3
            className="sidebar-icon"
          />

          <span>
            Academic Record
          </span>
        </NavLink>


        <NavLink
          to="/student/add-drop"
          className={linkClass}
        >
          <FilePenLine
            className="sidebar-icon"
          />

          <span>
            Add / Drop
          </span>
        </NavLink>


        <NavLink
          to="/student/browse"
          className={linkClass}
        >
          <Search
            className="sidebar-icon"
          />

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
          <LogOut
            className="sidebar-icon"
          />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;