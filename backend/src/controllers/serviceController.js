const Service = require("../models/Service");

const ALLOWED_CATEGORIES = [
  "TUTORING",
  "NOTES",
  "PRINTING",
  "CODING",
  "DESIGN",
  "HOSTEL_HELP",
  "OTHER",
];

const populateProvider = (query) => {
  return query.populate(
    "provider",
    "name email role studentId department batchYear"
  );
};

// =====================================================
// CREATE SERVICE
// AUTHENTICATED STUDENT / ADMIN
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

    const normalizedCategory = (
      category || "OTHER"
    ).toUpperCase();

    if (
      !ALLOWED_CATEGORIES.includes(
        normalizedCategory
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid service category",
      });
    }

    const service = await Service.create({
      title: title.trim(),
      description: description.trim(),
      category: normalizedCategory,
      contactInfo: contactInfo.trim(),
      provider: req.user.id,
      status: "ACTIVE",
    });

    const populatedService = await populateProvider(
      Service.findById(service._id)
    );

    return res.status(201).json({
      success: true,
      message: "Help service created successfully",
      service: populatedService,
    });
  } catch (error) {
    console.error("Create service error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating help service",
    });
  }
};

// =====================================================
// GET ACTIVE SERVICES
// STUDENT + ADMIN
// =====================================================

const getServices = async (req, res) => {
  try {
    const {
      category,
      search,
    } = req.query;

    const filter = {
      status: "ACTIVE",
    };

    if (category) {
      const normalizedCategory =
        category.toUpperCase();

      if (
        !ALLOWED_CATEGORIES.includes(
          normalizedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid service category",
        });
      }

      filter.category = normalizedCategory;
    }

    if (search && search.trim()) {
      const searchText = search.trim();

      filter.$or = [
        {
          title: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          category: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const services = await populateProvider(
      Service.find(filter)
        .sort({ createdAt: -1 })
    );

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Server error while searching help services",
    });
  }
};

// =====================================================
// GET SERVICE BY ID
// =====================================================

const getServiceById = async (req, res) => {
  try {
    const service = await populateProvider(
      Service.findById(req.params.id)
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    // Students should not see inactive services.
    if (
      service.status === "INACTIVE" &&
      req.user.role !== "ADMIN" &&
      service.provider._id.toString() !==
        req.user.id
    ) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error(
      "Get service by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching help service",
    });
  }
};

// =====================================================
// GET MY SERVICES
// PROVIDER
// =====================================================

const getMyServices = async (req, res) => {
  try {
    const services = await populateProvider(
      Service.find({
        provider: req.user.id,
      }).sort({
        createdAt: -1,
      })
    );

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error(
      "Get my services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching your services",
    });
  }
};

// =====================================================
// GET ALL SERVICES
// ADMIN ONLY
// =====================================================

const getAllServices = async (req, res) => {
  try {
    const {
      status,
      category,
      search,
    } = req.query;

    const filter = {};

    if (status) {
      if (
        !["ACTIVE", "INACTIVE"].includes(
          status.toUpperCase()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid service status",
        });
      }

      filter.status =
        status.toUpperCase();
    }

    if (category) {
      const normalizedCategory =
        category.toUpperCase();

      if (
        !ALLOWED_CATEGORIES.includes(
          normalizedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid service category",
        });
      }

      filter.category = normalizedCategory;
    }

    if (search && search.trim()) {
      const searchText = search.trim();

      filter.$or = [
        {
          title: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          category: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const services = await populateProvider(
      Service.find(filter).sort({
        createdAt: -1,
      })
    );

    return res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error(
      "Get all services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching all services",
    });
  }
};

// =====================================================
// UPDATE SERVICE
// OWNER OR ADMIN
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

    const service = await Service.findById(
      req.params.id
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    const isOwner =
      service.provider.toString() ===
      req.user.id;

    const isAdmin =
      req.user.role === "ADMIN";

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
          message:
            "Description cannot be empty",
        });
      }

      service.description =
        description.trim();
    }

    if (category !== undefined) {
      const normalizedCategory =
        category.toUpperCase();

      if (
        !ALLOWED_CATEGORIES.includes(
          normalizedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid service category",
        });
      }

      service.category =
        normalizedCategory;
    }

    if (contactInfo !== undefined) {
      if (!contactInfo.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Contact information cannot be empty",
        });
      }

      service.contactInfo =
        contactInfo.trim();
    }

    if (status !== undefined) {
      if (
        !["ACTIVE", "INACTIVE"].includes(
          status.toUpperCase()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service status",
        });
      }

      service.status =
        status.toUpperCase();
    }

    await service.save();

    const populatedService =
      await populateProvider(
        Service.findById(service._id)
      );

    return res.status(200).json({
      success: true,
      message:
        "Help service updated successfully",
      service: populatedService,
    });
  } catch (error) {
    console.error(
      "Update service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating help service",
    });
  }
};

// =====================================================
// DEACTIVATE SERVICE
// OWNER OR ADMIN
// =====================================================

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(
      req.params.id
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Help service not found",
      });
    }

    const isOwner =
      service.provider.toString() ===
      req.user.id;

    const isAdmin =
      req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to deactivate this help service",
      });
    }

    service.status = "INACTIVE";

    await service.save();

    return res.status(200).json({
      success: true,
      message:
        "Help service deactivated successfully",
    });
  } catch (error) {
    console.error(
      "Delete service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deactivating help service",
    });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  getAllServices,
  updateService,
  deleteService,
};