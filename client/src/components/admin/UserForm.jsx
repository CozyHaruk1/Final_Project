import { useState } from "react";

function UserForm({ mode, initialValues, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValues);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="advisor">Advisor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {form.role === "student" && (
        <div className="form-group">
          <label>Student ID</label>
          <input name="studentId" value={form.studentId} onChange={handleChange} required />
        </div>
      )}

      {mode === "create" && (
        <div className="form-group">
          <label>Initial password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
      )}

      {mode === "edit" && (
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            Account is active
          </label>
        </div>
      )}

      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}

export default UserForm;