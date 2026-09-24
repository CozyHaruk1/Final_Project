const Notification =
  require("../models/Notification");


// ======================================================
// GET MY NOTIFICATIONS
// GET /api/me/notifications
// ======================================================

const getMyNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find({
        userId: req.user.id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20);


    const unreadCount =
      notifications.filter(
        (notification) =>
          !notification.read
      ).length;


    return res.status(200).json({
      notifications,
      unreadCount,
    });

  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message:
        "Could not retrieve notifications.",
    });
  }
};


// ======================================================
// MARK ALL AS READ
// PATCH /api/me/notifications/read-all
// ======================================================

const markAllNotificationsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          userId: req.user.id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );


      return res.status(200).json({
        message:
          "Notifications marked as read.",
      });

    } catch (error) {
      console.error(
        "Mark notifications error:",
        error
      );

      return res.status(500).json({
        message:
          "Could not update notifications.",
      });
    }
  };


module.exports = {
  getMyNotifications,
  markAllNotificationsRead,
};