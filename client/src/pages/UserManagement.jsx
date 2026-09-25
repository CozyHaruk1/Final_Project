import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdminSidebar from "../components/admin/AdminSidebar";
import UserTable from "../components/admin/UserTable";

function UserManagement() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const data = await apiRequest("/users");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

const text = search.trim().toLowerCase();

  const shownUsers = users.filter((user) => {
    const roleOk = roleFilter === "all" || user.role === roleFilter;

    const searchOk =
      user.name.toLowerCase().includes(text) ||
      user.email.toLowerCase().includes(text) ||
      (user.studentId || "").toLowerCase().includes(text);

    return roleOk && searchOk;
  });

  const handleDelete = async (user) => {
    setError("");
    setMessage("");

    if (user._id === currentUser.id) {
      setError("You cannot delete your own account.");
      return;
    }

    const sure = window.confirm(
      `Delete ${user.name}? The account will be set to inactive.`
    );

    if (!sure) {
      return;
    }

    try {
      await apiRequest(`/users/${user._id}`, { method: "DELETE" });
      setMessage(`${user.name} was deleted.`);
      loadUsers();
    } 
    catch (err) {
      setError(err.message);
    }
  };

  const handleReactivate = async (user) => {
    setError("");
    setMessage("");

    try {
      await apiRequest(`/users/${user._id}`, {
        method: "PATCH",
        body: JSON.stringify({ active: true }),
      });
      setMessage(`${user.name} is active again.`);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (user) => {
    navigate(`/admin/users/${user._id}/edit`);
  };

  return (
    <div className="student-layout">

      <AdminSidebar />

      <main className="main">

        <Header
          title="User Management"
          name={currentUser ? currentUser.name : "Admin"}
          role="Administrator"
        />

        <div className="admin-content">

          <button onClick={() => navigate("/admin/users/new")}>
            Create user
          </button>

          <p>
            <input
              type="text"
              placeholder="Search by name, email or student ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="student">Student</option>
              <option value="advisor">Advisor</option>
              <option value="admin">Admin</option>
            </select>
          </p>

          {message && <p>{message}</p>}
          {error && <ErrorMessage message={error} />}

          {loading ? (
            <Loading message="Loading users..." />
          ) : (
            <UserTable
              users={shownUsers}
              currentUserId={currentUser ? currentUser.id : null}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReactivate={handleReactivate}
            />
          )}

        </div>

      </main>
    </div>
  );
}

export default UserManagement;