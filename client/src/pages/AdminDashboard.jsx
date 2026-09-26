import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/users")
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalAdvisors = users.filter((u) => u.role === "advisor").length;
  const activeUsers = users.filter((u) => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <div className="student-layout">
      <AdminSidebar />

      <main className="main">
        <Header
          title="Admin Dashboard"
          name={currentUser ? currentUser.name : "Admin"}
          role="Administrator"
        />

        <div className="admin-content">

          {error && <ErrorMessage message={error} />}

          {loading ? (
            <Loading message="Loading dashboard..." />
          ) : (
            <>
              <div className="cards">

                <div className="card">
                  <div className="card-icon blue">👥</div>
                  <div>
                    <p>Total Users</p>
                    <h2>{totalUsers}</h2>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon green">🎓</div>
                  <div>
                    <p>Students</p>
                    <h2>{totalStudents}</h2>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon orange">🧑‍🏫</div>
                  <div>
                    <p>Advisors</p>
                    <h2>{totalAdvisors}</h2>
                  </div>
                </div>

                <div className="card">
                  <div className="card-icon purple">✓</div>
                  <div>
                    <p>Active Users</p>
                    <h2>{activeUsers}</h2>
                    <span>{inactiveUsers} inactive</span>
                  </div>
                </div>

              </div>

              <div className="admin-quick-actions">
                <button onClick={() => navigate("/admin/users")}>
                  Manage Users
                </button>

                <button onClick={() => navigate("/admin/users/new")}>
                  Create User
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;