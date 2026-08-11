const LostFound = require("../models/LostFound");

// =====================================================
// CREATE LOST / FOUND REPORT
// =====================================================

const createLostFound = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      type,
      category,
      location,
      contactInfo,
    } = req.body;

    if (
      !title ||
      !description ||
      !type ||
      !location ||
      !contactInfo
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, type, location and contact information are required",
      });
    }

    const allowedTypes = ["LOST", "FOUND"];
    const normalizedType = type.toUpperCase();

    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be LOST or FOUND",
      });
    }

    const allowedCategories = [
      "ID_CARD",
      "BOOK",
      "ELECTRONICS",
      "CLOTHING",
      "KEYS",
      "DOCUMENT",
      "OTHER",
    ];

    const normalizedCategory = (
      category || "OTHER"
    ).toUpperCase();

    if (!allowedCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lost and found category",
      });
    }

    const item = await LostFound.create({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : "",
      type: normalizedType,
      category: normalizedCategory,
      location: location.trim(),
      contactInfo: contactInfo.trim(),
      reportedBy: req.user.id,
      status: "OPEN",
    });

    const populatedItem = await LostFound.findById(
      item._id
    )
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "claimedBy",
        "name email studentId department role"
      );

    return res.status(201).json({
      success: true,
      message:
        normalizedType === "LOST"
          ? "Lost item reported successfully"
          : "Found item reported successfully",
      item: populatedItem,
    });
  } catch (error) {
    console.error(
      "Create lost and found error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating lost and found report",
    });
  }
};

// =====================================================
// GET ALL OPEN LOST / FOUND ITEMS
// =====================================================

const getLostFoundItems = async (req, res) => {
  try {
    const {
      type,
      category,
      search,
    } = req.query;

    const filter = {
      status: "OPEN",
    };

    if (type) {
      const allowedTypes = ["LOST", "FOUND"];
      const normalizedType = type.toUpperCase();

      if (!allowedTypes.includes(normalizedType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lost and found type",
        });
      }

      filter.type = normalizedType;
    }

    if (category) {
      const allowedCategories = [
        "ID_CARD",
        "BOOK",
        "ELECTRONICS",
        "CLOTHING",
        "KEYS",
        "DOCUMENT",
        "OTHER",
      ];

      const normalizedCategory = category.toUpperCase();

      if (!allowedCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lost and found category",
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
        {
          location: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const items = await LostFound.find(filter)
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "claimedBy",
        "name email studentId department role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(
      "Get lost and found items error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching lost and found items",
    });
  }
};

// =====================================================
// GET MY LOST / FOUND ITEMS
// Includes items reported by OR claimed by current user
// =====================================================

const getMyLostFoundItems = async (req, res) => {
  try {
    const items = await LostFound.find({
      $or: [
        { reportedBy: req.user.id },
        { claimedBy: req.user.id },
      ],
    })
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "claimedBy",
        "name email studentId department role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(
      "Get my lost and found items error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching your lost and found items",
    });
  }
};

// =====================================================
// GET ITEM BY ID
// Reporter, claimant or admin can view the item
// =====================================================

const getLostFoundById = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "claimedBy",
        "name email studentId department role"
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost and found item not found",
      });
    }

    const isReporter =
      item.reportedBy._id.toString() === req.user.id;

    const isClaimant =
      item.claimedBy &&
      item.claimedBy._id.toString() === req.user.id;

    const isAdmin = req.user.role === "ADMIN";

    if (!isReporter && !isClaimant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this item",
      });
    }

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error(
      "Get lost and found item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching lost and found item",
    });
  }
};

// =====================================================
// CLAIM FOUND ITEM
// =====================================================

const claimLostFoundItem = async (req, res) => {
  try {
    const item = await LostFound.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost and found item not found",
      });
    }

    if (item.type !== "FOUND") {
      return res.status(400).json({
        success: false,
        message: "Only found items can be claimed",
      });
    }

    if (item.status !== "OPEN") {
      return res.status(400).json({
        success: false,
        message:
          "This item is no longer available for claiming",
      });
    }

    if (
      item.reportedBy.toString() === req.user.id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot claim an item that you reported",
      });
    }

    item.status = "CLAIMED";
    item.claimedBy = req.user.id;

    await item.save();

    const populatedItem = await LostFound.findById(
      item._id
    )
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "claimedBy",
        "name email studentId department role"
      );

    return res.status(200).json({
      success: true,
      message: "Item claimed successfully",
      item: populatedItem,
    });
  } catch (error) {
    console.error(
      "Claim lost and found item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while claiming lost and found item",
    });
  }
};

// =====================================================
// ADMIN UPDATE
// =====================================================

const updateLostFoundItem = async (req, res) => {
  try {
    const {
      status,
      adminNote,
      claimedBy,
    } = req.body;

    const item = await LostFound.findById(
      req.params.id
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost and found item not found",
      });
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "OPEN",
        "CLAIMED",
        "CLOSED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid lost and found status",
        });
      }

      item.status = status;
    }

    if (claimedBy !== undefined) {
      item.claimedBy =
        claimedBy === "" ? null : claimedBy;
    }

    if (adminNote !== undefined) {
      item.adminNote = adminNote.trim();
    }

    await item.save();

    const populatedItem = await LostFound.findById(
      item._id
    )
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "claimedBy",
        "name email studentId department role"
      );

    return res.status(200).json({
      success: true,
      message:
        "Lost and found item updated successfully",
      item: populatedItem,
    });
  } catch (error) {
    console.error(
      "Update lost and found item error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating lost and found item",
    });
  }
};

// =====================================================
// ADMIN GET ALL LOST / FOUND ITEMS
// =====================================================

const getAllLostFoundItems = async (req, res) => {
  try {
    const items = await LostFound.find({})
      .populate(
        "reportedBy",
        "name email studentId department role"
      )
      .populate(
        "claimedBy",
        "name email studentId department role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(
      "Get all lost and found items error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching all lost and found items",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createLostFound,
  getLostFoundItems,
  getMyLostFoundItems,
  getLostFoundById,
  claimLostFoundItem,
  updateLostFoundItem,
  getAllLostFoundItems,
};