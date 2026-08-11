const MaintenanceRequest = require("../models/MaintenanceRequest");

// =====================================================
// CREATE MAINTENANCE REQUEST
// Student reports a campus problem
// =====================================================

const createMaintenanceRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description and location are required",
      });
    }

    const request = await MaintenanceRequest.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "OTHER",
      location: location.trim(),
      reportedBy: req.user.id,
      status: "PENDING",
    });

    const populatedRequest =
      await MaintenanceRequest.findById(request._id)
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
      message: "Maintenance request submitted successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Create maintenance request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating maintenance request",
    });
  }
};

// =====================================================
// GET MY MAINTENANCE REQUESTS
// Student sees only their own reports
// =====================================================

const getMyMaintenanceRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({
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
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get my maintenance requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching your maintenance requests",
    });
  }
};

// =====================================================
// GET ALL MAINTENANCE REQUESTS
// Admin only
// =====================================================

const getAllMaintenanceRequests = async (req, res) => {
  try {
    const { status, category } = req.query;

    const filter = {};

    if (status) {
      const allowedStatuses = [
        "PENDING",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED",
      ];

      const normalizedStatus = status.toUpperCase();

      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid maintenance request status",
        });
      }

      filter.status = normalizedStatus;
    }

    if (category) {
      const allowedCategories = [
        "ELECTRICAL",
        "PLUMBING",
        "CLEANING",
        "HOSTEL",
        "CLASSROOM",
        "FURNITURE",
        "INTERNET",
        "OTHER",
      ];

      const normalizedCategory = category.toUpperCase();

      if (!allowedCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid maintenance category",
        });
      }

      filter.category = normalizedCategory;
    }

    const requests = await MaintenanceRequest.find(filter)
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
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get all maintenance requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching maintenance requests",
    });
  }
};

// =====================================================
// GET MAINTENANCE REQUEST BY ID
// Student can view own request
// Admin can view any request
// =====================================================

const getMaintenanceRequestById = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(
      req.params.id
    )
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "assignedTo",
        "name email studentId role"
      );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    const isOwner =
      request.reportedBy._id.toString() === req.user.id;

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this maintenance request",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(
      "Get maintenance request by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching maintenance request",
    });
  }
};

// =====================================================
// UPDATE MAINTENANCE REQUEST
// Admin only
// =====================================================

const updateMaintenanceRequest = async (req, res) => {
  try {
    const {
      status,
      assignedTo,
      adminNote,
    } = req.body;

    const request = await MaintenanceRequest.findById(
      req.params.id
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "PENDING",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid maintenance request status",
        });
      }

      request.status = status;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        request.assignedTo = null;
      } else {
        request.assignedTo = assignedTo;
      }
    }

    if (adminNote !== undefined) {
      request.adminNote = adminNote.trim();
    }

    await request.save();

    const populatedRequest =
      await MaintenanceRequest.findById(request._id)
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
      message: "Maintenance request updated successfully",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(
      "Update maintenance request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating maintenance request",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createMaintenanceRequest,
  getMyMaintenanceRequests,
  getAllMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
};