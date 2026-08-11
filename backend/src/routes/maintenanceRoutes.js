const express = require("express");

const {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
} = require("../controllers/maintenanceController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// STUDENT ROUTES
// =====================================================

// Submit a maintenance request
router.post("/", protect, createMaintenanceRequest);

// View my maintenance requests
router.get("/my", protect, getMyMaintenanceRequests);

// View a specific request
router.get("/:id", protect, getMaintenanceRequestById);

// =====================================================
// ADMIN ROUTES
// =====================================================

// View all maintenance requests
router.get(
  "/admin/all",
  protect,
  requireRole("ADMIN"),
  getAllMaintenanceRequests
);

// Update status, assignment or admin note
router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  updateMaintenanceRequest
);

module.exports = router;