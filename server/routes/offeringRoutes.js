const express = require("express");

const {
  getOfferings,
  getOfferingById,
  createOffering,
  updateOffering,
  deleteOffering,
} = require("../controllers/offeringController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  authorize("student", "advisor"),
  getOfferings
);

router.get(
  "/:id",
  authorize("student", "advisor"),
  getOfferingById
);

router.post(
  "/",
  authorize("advisor"),
  createOffering
);

router.patch(
  "/:id",
  authorize("advisor"),
  updateOffering
);

router.delete(
  "/:id",
  authorize("advisor"),
  deleteOffering
);

module.exports = router;