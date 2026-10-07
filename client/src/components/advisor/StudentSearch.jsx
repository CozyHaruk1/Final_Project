import { useState } from "react";

import apiRequest from "../../services/api";

function StudentSearch({ onSelect }) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const query = search.trim();
      const data = await apiRequest(
        `/students?search=${encodeURIComponent(query)}`
      );
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="advisor-student-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name, email or student ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Searching...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && searched && students.length === 0 && !error && (
        <p>No students found.</p>
      )}

      {students.length > 0 && (
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
            {students.map((student) => (
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