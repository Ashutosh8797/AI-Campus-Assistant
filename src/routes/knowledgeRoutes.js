const express = require("express");

const {
  createKnowledge,
  getKnowledge,
  getAllKnowledge,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
} = require("../controllers/knowledgeController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// STUDENT + ADMIN
// =====================================================

// Browse published Vijayawada campus knowledge
router.get("/", protect, getKnowledge);

// View one published knowledge item
router.get("/:id", protect, getKnowledgeById);

// =====================================================
// ADMIN ONLY
// =====================================================

// Create knowledge
router.post(
  "/",
  protect,
  requireRole("ADMIN"),
  createKnowledge
);

// View all knowledge including unpublished
router.get(
  "/admin/all",
  protect,
  requireRole("ADMIN"),
  getAllKnowledge
);

// Update knowledge
router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  updateKnowledge
);

// Delete knowledge
router.delete(
  "/:id",
  protect,
  requireRole("ADMIN"),
  deleteKnowledge
);

module.exports = router;