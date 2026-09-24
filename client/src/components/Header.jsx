import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Bell,
  CheckCheck
} from "lucide-react";

import {
  getCurrentUser,
  getMyNotifications,
  markAllNotificationsRead
} from "../services/api";


function Header({
  title = "Dashboard",
  name = "Student",
  role = "Student"
}) {
  const user =
    getCurrentUser();

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount
  ] = useState(0);

  const [
    notificationsOpen,
    setNotificationsOpen
  ] = useState(false);

  const notificationRef =
    useRef(null);


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


  // ====================================================
  // LOAD NOTIFICATIONS
  // ====================================================

  const loadNotifications =
    async () => {
      try {
        const data =
          await getMyNotifications();

        setNotifications(
          data.notifications || []
        );

        setUnreadCount(
          data.unreadCount || 0
        );

      } catch (error) {
        console.error(
          "Could not load notifications:",
          error
        );
      }
    };


  useEffect(() => {
    if (
      user?.role === "student"
    ) {
      loadNotifications();
    }
  }, []);


  // ====================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // ====================================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setNotificationsOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  // ====================================================
  // BELL
  // ====================================================

  const handleNotificationToggle =
    async () => {
      const nextOpen =
        !notificationsOpen;

      setNotificationsOpen(
        nextOpen
      );

      /*
        Refresh whenever the
        student opens the bell.
      */
      if (nextOpen) {
        await loadNotifications();
      }
    };


  // ====================================================
  // MARK ALL READ
  // ====================================================

  const handleMarkAllRead =
    async () => {
      try {
        await markAllNotificationsRead();

        setNotifications(
          (current) =>
            current.map(
              (notification) => ({
                ...notification,
                read: true
              })
            )
        );

        setUnreadCount(0);

      } catch (error) {
        console.error(
          "Could not mark notifications as read:",
          error
        );
      }
    };


  const formatNotificationTime =
    (value) => {
      if (!value) {
        return "";
      }

      return new Date(
        value
      ).toLocaleString();
    };


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
          </span>

          {" "}👋
        </p>

      </div>


      <div className="header-right">

        {user?.role === "student" && (

          <div
            className="notification-wrapper"
            ref={notificationRef}
          >

            <button
              type="button"
              className="notification-button"
              onClick={
                handleNotificationToggle
              }
              aria-label="Notifications"
            >

              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}

            </button>


            {notificationsOpen && (

              <div className="notification-popup">

                <div className="notification-popup-header">

                  <div>
                    <h3>
                      Notifications
                    </h3>

                    <p>
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : "You're all caught up"}
                    </p>
                  </div>


                  {unreadCount > 0 && (

                    <button
                      type="button"
                      className="mark-read-button"
                      onClick={
                        handleMarkAllRead
                      }
                    >
                      <CheckCheck
                        size={15}
                      />

                      Mark all read
                    </button>

                  )}

                </div>


                <div className="notification-list">

                  {notifications.length === 0 ? (

                    <div className="notification-empty">

                      <Bell size={24} />

                      <p>
                        No notifications yet.
                      </p>

                    </div>

                  ) : (

                    notifications.map(
                      (notification) => (

                        <div
                          className={`notification-item ${
                            notification.read
                              ? ""
                              : "unread"
                          }`}
                          key={
                            notification._id
                          }
                        >

                          <div className="notification-item-icon">

                            {notification.type ===
                            "course_registered"
                              ? "+"
                              : "−"}

                          </div>


                          <div className="notification-item-content">

                            <strong>
                              {notification.type ===
                              "course_registered"
                                ? "Course Registered"
                                : "Course Dropped"}
                            </strong>

                            <p>
                              {
                                notification.message
                              }
                            </p>

                            <span>
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </span>

                          </div>

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            )}

          </div>

        )}


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