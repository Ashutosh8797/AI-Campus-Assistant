const express = require("express");

const {
  createHelpRequest,
  getMyRequests,
  getReceivedRequests,
  getAllHelpRequests,
  acceptHelpRequest,
  rejectHelpRequest,
  cancelHelpRequest,
} = require("../controllers/helpRequestController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// STUDENT / PROVIDER ROUTES
// =====================================================

// Student sends a help request
router.post("/", protect, createHelpRequest);

// Requests sent by the logged-in student
router.get("/my", protect, getMyRequests);

// Requests received by the logged-in provider
router.get("/received", protect, getReceivedRequests);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Admin views all help requests
router.get(
  "/admin/all",
  protect,
  requireRole("ADMIN"),
  getAllHelpRequests
);

// =====================================================
// REQUEST ACTIONS
// =====================================================

// Provider accepts a request
router.put(
  "/:id/accept",
  protect,
  acceptHelpRequest
);

// Provider rejects a request
router.put(
  "/:id/reject",
  protect,
  rejectHelpRequest
);

// Requester cancels a pending request
router.put(
  "/:id/cancel",
  protect,
  cancelHelpRequest
);

module.exports = router;