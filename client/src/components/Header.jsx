import { getCurrentUser } from "../services/api";

function Header({
  title = "Dashboard",
  name = "Student",
  role = "Student"
}) {
  const user = getCurrentUser();

  const displayName =
    name ||
    user?.name ||
    "Student";

  const displayRole =
    role ||
    user?.role ||
    "Student";

  const initial =
    displayName
      ? displayName
          .charAt(0)
          .toUpperCase()
      : "S";

  return (
    <header className="header">

      <div className="header-left">
        <h1>
          {title}
        </h1>

        <p>
          Welcome back,{" "}
          <span>
            {displayName}
          </span>{" "}
          👋
        </p>
      </div>


      <div className="header-right">

        <div className="notification">
          🔔
        </div>


        <div className="profile-wrapper">

          <div className="profile">

            <div className="avatar">
              {initial}
            </div>

            <div className="profile-info">
              <strong>
                {displayName}
              </strong>

              <small>
                {displayRole}
              </small>
            </div>

          </div>


          <div className="profile-popup">

            <div className="profile-popup-top">

              <div className="avatar profile-popup-avatar">
                {initial}
              </div>

              <div>
                <strong>
                  {displayName}
                </strong>

                <p>
                  {displayRole}
                </p>
              </div>

            </div>


            <div className="profile-popup-divider" />


            {user?.studentId && (
              <div className="profile-popup-detail">

                <span>
                  Student ID
                </span>

                <strong>
                  {user.studentId}
                </strong>

              </div>
            )}


            {user?.email && (
              <div className="profile-popup-detail">

                <span>
                  Email
                </span>

                <strong>
                  {user.email}
                </strong>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  );
}

export default Header;