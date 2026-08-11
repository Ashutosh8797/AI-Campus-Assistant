const Safety = require("../models/Safety");

const createSafety = async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and location are required",
      });
    }

    const safety = await Safety.create({
      title,
      description,
      category,
      location,
      priority: priority || "HIGH",
      reportedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Safety report submitted successfully",
      safety,
    });
  } catch (error) {
    console.error("Create safety error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while submitting safety report",
    });
  }
};

const getSafety = async (req, res) => {
  try {
    const filter =
      req.user.role === "ADMIN"
        ? {}
        : { reportedBy: req.user.id };

    const safety = await Safety.find(filter)
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: safety.length,
      safety,
    });
  } catch (error) {
    console.error("Get safety error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching safety reports",
    });
  }
};

const getSafetyById = async (req, res) => {
  try {
    const safety = await Safety.findById(req.params.id)
      .populate("reportedBy", "name email role");

    if (!safety) {
      return res.status(404).json({
        success: false,
        message: "Safety report not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      safety.reportedBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      safety,
    });
  } catch (error) {
    console.error("Get safety by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching safety report",
    });
  }
};

const updateSafety = async (req, res) => {
  try {
    const { status, priority, resolutionNote } = req.body;

    const safety = await Safety.findById(req.params.id);

    if (!safety) {
      return res.status(404).json({
        success: false,
        message: "Safety report not found",
      });
    }

    if (status !== undefined) safety.status = status;
    if (priority !== undefined) safety.priority = priority;
    if (resolutionNote !== undefined) {
      safety.resolutionNote = resolutionNote;
    }

    await safety.save();

    res.status(200).json({
      success: true,
      message: "Safety report updated successfully",
      safety,
    });
  } catch (error) {
    console.error("Update safety error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating safety report",
    });
  }
};

module.exports = {
  createSafety,
  getSafety,
  getSafetyById,
  updateSafety,
};