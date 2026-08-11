const express = require("express");

const {
  createSafety,
  getSafety,
  getSafetyById,
  updateSafety,
} = require("../controllers/safetyController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, createSafety);
router.get("/", protect, getSafety);
router.get("/:id", protect, getSafetyById);

router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  updateSafety
);

module.exports = router;
