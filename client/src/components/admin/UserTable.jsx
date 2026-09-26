function UserTable({ users, currentUserId, onEdit, onDelete, onReactivate }) {
  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Student ID</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.role === "student" ? user.studentId : "-"}</td>
            <td>{user.active ? "Active" : "Inactive"}</td>
            <td>
              <button onClick={() => onEdit(user)}>Edit</button>

              {user.active ? (
                <button
                  onClick={() => onDelete(user)}
                  disabled={user._id === currentUserId}
                >
                  Delete
                </button>
              ) : (
                <button onClick={() => onReactivate(user)}>Reactivate</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;