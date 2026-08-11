const express = require("express");

const {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  getAllServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CAMPUS SERVICE MARKETPLACE
// =====================================================

// Create a service
router.post("/", protect, createService);

// Get active services / search / filter
router.get("/", protect, getServices);

// Get services created by logged-in provider
router.get("/my", protect, getMyServices);

// Admin: get all services including inactive
router.get("/admin/all", protect, getAllServices);

// Get one service
router.get("/:id", protect, getServiceById);

// Update own service or admin-managed service
router.put("/:id", protect, updateService);

// Deactivate own service or admin-managed service
router.delete("/:id", protect, deleteService);

module.exports = router;