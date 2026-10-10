import { useEffect, useState } from "react";

import apiRequest from "../../services/api";

function StudentSearch({ onSelect }) {
  const [allStudents, setAllStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/students");
        setAllStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const text = search.trim().toLowerCase();

  const shownStudents = allStudents.filter((student) => {
    if (!text) {
      return true;
    }

    return (
      student.name.toLowerCase().includes(text) ||
      student.email.toLowerCase().includes(text) ||
      (student.studentId || "").toLowerCase().includes(text)
    );
  });

  return (
    <div className="advisor-student-search">
      <input
        type="text"
        placeholder="Search by name, email or student ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading students...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && shownStudents.length === 0 && (
        <p>No students found.</p>
      )}

      {shownStudents.length > 0 && (
        <table className="student-search-results">
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Email</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shownStudents.map((student) => (
              <tr key={student._id}>
                <td>{student.name}</td>
                <td>{student.studentId}</td>
                <td>{student.email}</td>
                <td>{student.active ? "Active" : "Inactive"}</td>
                <td>
                  <button onClick={() => onSelect(student)}>Select</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentSearch;
