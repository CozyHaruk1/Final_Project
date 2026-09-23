const express = require("express");

const {
  registerStudent,
  removeRegistration,
} = require("../controllers/registrationController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("advisor"));

router.post("/", registerStudent);
router.delete("/:id", removeRegistration);

module.exports = router;