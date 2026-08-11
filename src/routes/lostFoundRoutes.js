const express = require("express");

const {
  createLostFound,
  getLostFound,
  getLostFoundById,
  updateLostFound,
} = require("../controllers/lostFoundController");

const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, createLostFound);

router.get("/", protect, getLostFound);

router.get("/:id", protect, getLostFoundById);

router.put(
  "/:id",
  protect,
  requireRole("ADMIN"),
  updateLostFound
);

module.exports = router;
