const express = require("express");

const {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
} = require("../controllers/maintenanceController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, createMaintenance);

router.get("/", protect, getMaintenance);

router.get("/:id", protect, getMaintenanceById);

router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  updateMaintenance
);

module.exports = router;