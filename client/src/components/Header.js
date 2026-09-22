function Header({ name = "Student", role = "Student" }) {
  const initial = name ? name.charAt(0).toUpperCase() : "S";

  return (
    <header className="header">
      <div className="header-left">
        <h1>Dashboard</h1>

        <p>
          Welcome back, <span>{name}</span> 👋
        </p>
      </div>

      <div className="profile">
        <div className="notification">🔔</div>

        <div className="avatar">{initial}</div>

        <div className="profile-info">
          <strong>{name}</strong>
          <small>{role}</small>
        </div>
      </div>
    </header>
  );
}

export default Header;