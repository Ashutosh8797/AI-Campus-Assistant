const express = require("express");

const {
  createKnowledge,
  getKnowledge,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
} = require("../controllers/knowledgeController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Health check endpoint for knowledge API
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Knowledge API is working",
  });
});

// Create knowledge entry — requires admin role
router.post("/", protect, requireRole("ADMIN"), createKnowledge);

// Get all published knowledge — authenticated users only
router.get("/", protect, getKnowledge);

// Get one knowledge entry — authenticated users only
router.get("/:id", protect, getKnowledgeById);

// Update knowledge entry — requires admin role
router.put("/:id", protect, requireRole("ADMIN"), updateKnowledge);

// Delete knowledge entry — requires admin role
router.delete("/:id", protect, requireRole("ADMIN"), deleteKnowledge);

module.exports = router;