import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import AdminSidebar from "../components/admin/AdminSidebar";
import UserForm from "../components/admin/UserForm";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(`/users/${id}`)
      .then((data) => setUser(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (form) => {
    setError("");

    try {
      await apiRequest(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });

      alert("User updated successfully.");
      navigate("/admin/users");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="student-layout">
      <AdminSidebar />

      <main className="main">
        <Header
          title="Edit User"
          name={currentUser ? currentUser.name : "Admin"}
          role="Administrator"
        />

        <div className="admin-content">
          {error && <ErrorMessage message={error} />}

          {loading && <Loading message="Loading user..." />}

          {user && (
            <UserForm
              mode="edit"
              initialValues={{
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId || "",
                active: user.active,
              }}
              onSubmit={handleSave}
              onCancel={() => navigate("/admin/users")}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default EditUser;