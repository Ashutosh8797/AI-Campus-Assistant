const express = require("express");

const {
  createSafetyReport,
  getMySafetyReports,
  getAllSafetyReports,
  getSafetyReportById,
  updateSafetyReport,
} = require("../controllers/safetyController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// STUDENT ROUTES
// =====================================================

// Submit a safety report
router.post("/", protect, createSafetyReport);

// View my safety reports
router.get("/my", protect, getMySafetyReports);

// View a specific safety report
router.get("/:id", protect, getSafetyReportById);

// =====================================================
// ADMIN ROUTES
// =====================================================

// View all safety reports
router.get(
  "/admin/all",
  protect,
  requireRole("ADMIN"),
  getAllSafetyReports
);

// Update safety report
router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  updateSafetyReport
);

module.exports = router;