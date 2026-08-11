const express = require("express");

const {
  createHelpRequest,
  getMyRequests,
  getReceivedRequests,
  acceptHelpRequest,
  rejectHelpRequest,
  cancelHelpRequest,
} = require("../controllers/helpRequestController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Student sends a help request
router.post("/", protect, createHelpRequest);

// Requests sent by the logged-in student
router.get("/my", protect, getMyRequests);

// Requests received by the logged-in provider
router.get("/received", protect, getReceivedRequests);

// Provider accepts a request
router.put("/:id/accept", protect, acceptHelpRequest);

// Provider rejects a request
router.put("/:id/reject", protect, rejectHelpRequest);

// Requester cancels a pending request
router.put("/:id/cancel", protect, cancelHelpRequest);

module.exports = router;