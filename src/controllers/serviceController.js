const Service = require("../models/Service");

// =====================================================
// CREATE HELP SERVICE
// =====================================================

const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      contactInfo,
    } = req.body;

    if (!title || !description || !contactInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description and contact information are required",
      });
    }

    const service = await Service.create({
      title,
      description,
      category: category || "OTHER",
      contactInfo,
      provider: req.user.id,
    });

    const populatedService = await Service.findById(
      service._id
    ).populate(
      "provider",
      "name email role studentId department batchYear"
    );

    res.status(201).json({
      success: true,
      message: "Help service created successfully",
      service: populatedService,
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating help service",
    });
  }
};

// =====================================================
// GET / SEARCH HELP SERVICES
// =====================================================

const getServices = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = {
      status: "ACTIVE",
    };

    if (category) {
      const allowedCategories = [
        "TUTORING",
        "NOTES",
        "PRINTING",
        "CODING",
        "DESIGN",
        "HOSTEL_HELP",
        "OTHER",
      ];

      const normalizedCategory = category.toUpperCase();

      if (!allowedCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service category",
        });
      }

      filter.category = normalizedCategory;
    }

    if (search && search.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const services = await Service.find(filter)
      .populate(
        "provider",
        "name email role studentId department batchYear"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while searching help services",
    });
  }
};

// =====================================================
// GET HELP SERVICE BY ID
// =====================================================

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(
      req.params.id
    ).populate(
      "provider",
      "name email role studentId department batchYear"
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching help service",
    });
  }
};

// =====================================================
// UPDATE HELP SERVICE
// Provider can update own service
// Admin can update any service
// =====================================================

const updateService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      contactInfo,
      status,
    } = req.body;

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    const isOwner =
      service.provider.toString() === req.user.id;

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this help service",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      service.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }

      service.description = description.trim();
    }

    if (category !== undefined) {
      const allowedCategories = [
        "TUTORING",
        "NOTES",
        "PRINTING",
        "CODING",
        "DESIGN",
        "HOSTEL_HELP",
        "OTHER",
      ];

      const normalizedCategory = category.toUpperCase();

      if (!allowedCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service category",
        });
      }

      service.category = normalizedCategory;
    }

    if (contactInfo !== undefined) {
      if (!contactInfo.trim()) {
        return res.status(400).json({
          success: false,
          message: "Contact information cannot be empty",
        });
      }

      service.contactInfo = contactInfo.trim();
    }

    if (status !== undefined) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid service status",
        });
      }

      service.status = status;
    }

    await service.save();

    const populatedService = await Service.findById(
      service._id
    ).populate(
      "provider",
      "name email role studentId department batchYear"
    );

    res.status(200).json({
      success: true,
      message: "Help service updated successfully",
      service: populatedService,
    });
  } catch (error) {
    console.error("Update service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating help service",
    });
  }
};

// =====================================================
// DELETE / DEACTIVATE HELP SERVICE
// Provider can deactivate own service
// Admin can deactivate any service
// =====================================================

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    const isOwner =
      service.provider.toString() === req.user.id;

    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this help service",
      });
    }

    // Soft delete: keep the record but hide it
    service.status = "INACTIVE";

    await service.save();

    res.status(200).json({
      success: true,
      message: "Help service deactivated successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deactivating help service",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
};