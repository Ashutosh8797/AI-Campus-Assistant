const HelpRequest = require("../models/HelpRequest");
const Service = require("../models/Service");

// =====================================================
// CREATE HELP REQUEST
// =====================================================

const createHelpRequest = async (req, res) => {
  try {
    const { serviceId, message } = req.body;

    if (!serviceId || !message) {
      return res.status(400).json({
        success: false,
        message: "Service ID and message are required",
      });
    }

    if (message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 5 characters",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    if (service.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "This help service is currently inactive",
      });
    }

    if (service.provider.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot request help from your own service",
      });
    }

    const existingRequest = await HelpRequest.findOne({
      service: serviceId,
      requester: req.user.id,
      status: "PENDING",
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending request for this service",
      });
    }

    const helpRequest = await HelpRequest.create({
      service: serviceId,
      requester: req.user.id,
      provider: service.provider,
      message: message.trim(),
    });

    const populatedRequest =
      await HelpRequest.findById(helpRequest._id)
        .populate(
          "service",
          "title description category status"
        )
        .populate(
          "requester",
          "name email studentId department batchYear"
        )
        .populate(
          "provider",
          "name email studentId department batchYear"
        );

    return res.status(201).json({
      success: true,
      message: "Help request sent successfully",
      helpRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Create help request error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating help request",
    });
  }
};

// =====================================================
// GET REQUESTS SENT BY CURRENT STUDENT
// =====================================================

const getMyRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({
      requester: req.user.id,
    })
      .populate(
        "service",
        "title description category status"
      )
      .populate(
        "provider",
        "name email studentId department batchYear"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my requests error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching your requests",
    });
  }
};

// =====================================================
// GET REQUESTS RECEIVED BY CURRENT PROVIDER
// =====================================================

const getReceivedRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({
      provider: req.user.id,
    })
      .populate(
        "service",
        "title description category status"
      )
      .populate(
        "requester",
        "name email studentId department batchYear"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get received requests error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching received requests",
    });
  }
};

// =====================================================
// ADMIN GET ALL HELP REQUESTS
// =====================================================

const getAllHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({})
      .populate(
        "service",
        "title description category status"
      )
      .populate(
        "requester",
        "name email studentId department batchYear"
      )
      .populate(
        "provider",
        "name email studentId department batchYear"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "Get all help requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching all help requests",
    });
  }
};

// =====================================================
// ACCEPT HELP REQUEST
// =====================================================

const acceptHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(
      req.params.id
    );

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    if (
      helpRequest.provider.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to accept this request",
      });
    }

    if (helpRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending requests can be accepted",
      });
    }

    helpRequest.status = "ACCEPTED";

    await helpRequest.save();

    const populatedRequest =
      await HelpRequest.findById(helpRequest._id)
        .populate(
          "service",
          "title description category status"
        )
        .populate(
          "requester",
          "name email studentId department batchYear"
        )
        .populate(
          "provider",
          "name email studentId department batchYear"
        );

    return res.status(200).json({
      success: true,
      message: "Help request accepted",
      helpRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Accept help request error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while accepting help request",
    });
  }
};

// =====================================================
// REJECT HELP REQUEST
// =====================================================

const rejectHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(
      req.params.id
    );

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    if (
      helpRequest.provider.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to reject this request",
      });
    }

    if (helpRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending requests can be rejected",
      });
    }

    helpRequest.status = "REJECTED";

    await helpRequest.save();

    const populatedRequest =
      await HelpRequest.findById(helpRequest._id)
        .populate(
          "service",
          "title description category status"
        )
        .populate(
          "requester",
          "name email studentId department batchYear"
        )
        .populate(
          "provider",
          "name email studentId department batchYear"
        );

    return res.status(200).json({
      success: true,
      message: "Help request rejected",
      helpRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Reject help request error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while rejecting help request",
    });
  }
};

// =====================================================
// CANCEL HELP REQUEST
// =====================================================

const cancelHelpRequest = async (req, res) => {
  try {
    const helpRequest = await HelpRequest.findById(
      req.params.id
    );

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        message: "Help request not found",
      });
    }

    if (
      helpRequest.requester.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to cancel this request",
      });
    }

    if (helpRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending requests can be cancelled",
      });
    }

    helpRequest.status = "CANCELLED";

    await helpRequest.save();

    return res.status(200).json({
      success: true,
      message: "Help request cancelled",
      helpRequest,
    });
  } catch (error) {
    console.error("Cancel help request error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while cancelling help request",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createHelpRequest,
  getMyRequests,
  getReceivedRequests,
  getAllHelpRequests,
  acceptHelpRequest,
  rejectHelpRequest,
  cancelHelpRequest,
};