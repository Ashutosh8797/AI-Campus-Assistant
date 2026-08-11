const express = require("express");

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// HELP SERVICES
// =====================================================

// Create a help service
router.post("/", protect, createService);

// Get/search active help services
router.get("/", protect, getServices);

// Get one help service
router.get("/:id", protect, getServiceById);

// Update own service or admin-managed service
router.put("/:id", protect, updateService);

// Deactivate own service or admin-managed service
router.delete("/:id", protect, deleteService);

module.exports = router;