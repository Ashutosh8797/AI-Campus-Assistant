const express = require("express");

const {
  createLostFound,
  getLostFoundItems,
  getMyLostFoundItems,
  getLostFoundById,
  claimLostFoundItem,
  updateLostFoundItem,
  getAllLostFoundItems,
} = require("../controllers/lostFoundController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// STUDENT ROUTES
// =====================================================

// Report a lost or found item
router.post("/", protect, createLostFound);

// Search / browse open lost and found items
router.get("/", protect, getLostFoundItems);

// View my own reports
router.get("/my", protect, getMyLostFoundItems);

// =====================================================
// ADMIN ROUTES
// =====================================================

// View all lost and found records
router.get(
  "/admin/all",
  protect,
  requireRole("ADMIN"),
  getAllLostFoundItems
);

// Update item status, claim information or admin note
router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  updateLostFoundItem
);

// =====================================================
// ITEM ROUTES
// =====================================================

// Claim a found item
router.post("/:id/claim", protect, claimLostFoundItem);

// View a specific item
router.get("/:id", protect, getLostFoundById);

module.exports = router;