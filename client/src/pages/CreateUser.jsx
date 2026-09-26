import { useState } from "react";
import { useNavigate } from "react-router-dom";

import apiRequest, { getCurrentUser } from "../services/api";
import Header from "../components/Header";
import ErrorMessage from "../components/ErrorMessage";
import AdminSidebar from "../components/admin/AdminSidebar";
import UserForm from "../components/admin/UserForm";

const emptyUser = {
  name: "",
  email: "",
  password: "",
  role: "student",
  studentId: "",
};

function CreateUser() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [error, setError] = useState("");

  const handleCreate = async (form) => {
    setError("");

    try {
      await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify(form),
      });

      alert("User created successfully.");
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
          title="Create User"
          name={currentUser ? currentUser.name : "Admin"}
          role="Administrator"
        />

        <div className="admin-content">
          {error && <ErrorMessage message={error} />}

          <UserForm
            mode="create"
            initialValues={emptyUser}
            onSubmit={handleCreate}
            onCancel={() => navigate("/admin/users")}
          />
        </div>
      </main>
    </div>
  );
}

export default CreateUser;