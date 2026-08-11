const Safety = require("../models/Safety");

// =====================================================
// CREATE SAFETY REPORT
// Student reports a campus safety issue
// =====================================================

const createSafetyReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      priority,
    } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, category and location are required",
      });
    }

    const allowedCategories = [
      "EMERGENCY",
      "SECURITY",
      "FIRE",
      "MEDICAL",
      "HARASSMENT",
      "ACCIDENT",
      "OTHER",
    ];

    const normalizedCategory = category.toUpperCase();

    if (!allowedCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid safety category",
      });
    }

    const allowedPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ];

    const normalizedPriority = (
      priority || "HIGH"
    ).toUpperCase();

    if (!allowedPriorities.includes(normalizedPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid safety priority",
      });
    }

    const report = await Safety.create({
      title: title.trim(),
      description: description.trim(),
      category: normalizedCategory,
      location: location.trim(),
      priority: normalizedPriority,
      reportedBy: req.user.id,
      status: "REPORTED",
    });

    const populatedReport = await Safety.findById(
      report._id
    )
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "assignedTo",
        "name email studentId role"
      );

    return res.status(201).json({
      success: true,
      message: "Safety report submitted successfully",
      report: populatedReport,
    });
  } catch (error) {
    console.error("Create safety report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating safety report",
    });
  }
};

// =====================================================
// GET MY SAFETY REPORTS
// Student sees only their own reports
// =====================================================

const getMySafetyReports = async (req, res) => {
  try {
    const reports = await Safety.find({
      reportedBy: req.user.id,
    })
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "assignedTo",
        "name email studentId role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get my safety reports error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching your safety reports",
    });
  }
};

// =====================================================
// GET ALL SAFETY REPORTS
// ADMIN ONLY
// =====================================================

const getAllSafetyReports = async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    const filter = {};

    if (status) {
      const allowedStatuses = [
        "REPORTED",
        "INVESTIGATING",
        "RESOLVED",
        "REJECTED",
      ];

      const normalizedStatus = status.toUpperCase();

      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid safety report status",
        });
      }

      filter.status = normalizedStatus;
    }

    if (category) {
      const allowedCategories = [
        "EMERGENCY",
        "SECURITY",
        "FIRE",
        "MEDICAL",
        "HARASSMENT",
        "ACCIDENT",
        "OTHER",
      ];

      const normalizedCategory = category.toUpperCase();

      if (!allowedCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid safety category",
        });
      }

      filter.category = normalizedCategory;
    }

    if (priority) {
      const allowedPriorities = [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
      ];

      const normalizedPriority = priority.toUpperCase();

      if (!allowedPriorities.includes(normalizedPriority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid safety priority",
        });
      }

      filter.priority = normalizedPriority;
    }

    const reports = await Safety.find(filter)
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "assignedTo",
        "name email studentId role"
      )
      .sort({
        priority: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error(
      "Get all safety reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching safety reports",
    });
  }
};

// =====================================================
// GET SAFETY REPORT BY ID
// Student can view own report
// Admin can view any report
// =====================================================

const getSafetyReportById = async (req, res) => {
  try {
    const report = await Safety.findById(req.params.id)
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "assignedTo",
        "name email studentId role"
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Safety report not found",
      });
    }

    const isOwner =
      report.reportedBy._id.toString() === req.user.id;

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this safety report",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(
      "Get safety report by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching safety report",
    });
  }
};

// =====================================================
// UPDATE SAFETY REPORT
// ADMIN ONLY
// =====================================================

const updateSafetyReport = async (req, res) => {
  try {
    const {
      status,
      assignedTo,
      priority,
      resolutionNote,
    } = req.body;

    const report = await Safety.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Safety report not found",
      });
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "REPORTED",
        "INVESTIGATING",
        "RESOLVED",
        "REJECTED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid safety report status",
        });
      }

      report.status = status;
    }

    if (priority !== undefined) {
      const allowedPriorities = [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
      ];

      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid safety priority",
        });
      }

      report.priority = priority;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        report.assignedTo = null;
      } else {
        report.assignedTo = assignedTo;
      }
    }

    if (resolutionNote !== undefined) {
      report.resolutionNote = resolutionNote.trim();
    }

    await report.save();

    const populatedReport = await Safety.findById(
      report._id
    )
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "assignedTo",
        "name email studentId role"
      );

    return res.status(200).json({
      success: true,
      message: "Safety report updated successfully",
      report: populatedReport,
    });
  } catch (error) {
    console.error(
      "Update safety report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating safety report",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createSafetyReport,
  getMySafetyReports,
  getAllSafetyReports,
  getSafetyReportById,
  updateSafetyReport,
};