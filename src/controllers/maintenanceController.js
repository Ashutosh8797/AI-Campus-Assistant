const Maintenance = require("../models/Maintenance");

const createMaintenance = async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category and location are required",
      });
    }

    const maintenance = await Maintenance.create({
      title,
      description,
      category,
      location,
      priority: priority || "MEDIUM",
      reportedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Maintenance complaint submitted successfully",
      maintenance,
    });
  } catch (error) {
    console.error("Create maintenance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting complaint",
    });
  }
};

const getMaintenance = async (req, res) => {
  try {
    const filter =
      req.user.role === "ADMIN"
        ? {}
        : { reportedBy: req.user.id };

    const maintenance = await Maintenance.find(filter)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: maintenance.length,
      maintenance,
    });
  } catch (error) {
    console.error("Get maintenance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching complaints",
    });
  }
};

const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate("reportedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance complaint not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      maintenance.reportedBy._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      maintenance,
    });
  } catch (error) {
    console.error("Get maintenance by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching complaint",
    });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const { status, priority, resolutionNote, assignedTo } = req.body;

    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Maintenance complaint not found",
      });
    }

    if (status !== undefined) maintenance.status = status;
    if (priority !== undefined) maintenance.priority = priority;
    if (resolutionNote !== undefined) {
      maintenance.resolutionNote = resolutionNote;
    }
    if (assignedTo !== undefined) maintenance.assignedTo = assignedTo;

    await maintenance.save();

    res.status(200).json({
      success: true,
      message: "Maintenance complaint updated successfully",
      maintenance,
    });
  } catch (error) {
    console.error("Update maintenance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating complaint",
    });
  }
};

module.exports = {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
};
