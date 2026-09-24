const express =
  require("express");

const {
  getMyNotifications,
  markAllNotificationsRead,
} =
  require(
    "../controllers/notificationController"
  );

const protect =
  require(
    "../middleware/authMiddleware"
  );

const authorize =
  require(
    "../middleware/roleMiddleware"
  );

const router =
  express.Router();


router.use(
  protect
);

router.use(
  authorize("student")
);


router.get(
  "/me/notifications",
  getMyNotifications
);

router.patch(
  "/me/notifications/read-all",
  markAllNotificationsRead
);


module.exports = router;