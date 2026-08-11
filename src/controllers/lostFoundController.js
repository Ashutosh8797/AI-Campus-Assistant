const LostFound = require("../models/LostFound");

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

    if (!title || !description || !type || !location || !contactInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, type, location and contact information are required",
      });
    }

    const item = await LostFound.create({
      title,
      description,
      imageUrl: imageUrl || "",
      type,
      category: category || "OTHER",
      location,
      contactInfo,
      reportedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Lost & Found item submitted successfully",
      item,
    });
  } catch (error) {
    console.error("Create lost/found error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while submitting item",
    });
  }
};

const getLostFound = async (req, res) => {
  try {
    const items = await LostFound.find({})
      .populate("reportedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get lost/found error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching items",
    });
  }
};

const getLostFoundById = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id)
      .populate("reportedBy", "name email role");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost & Found item not found",
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get lost/found by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching item",
    });
  }
};

const updateLostFound = async (req, res) => {
  try {
    const { status } = req.body;

    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost & Found item not found",
      });
    }

    if (status !== undefined) {
      item.status = status;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: "Lost & Found item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update lost/found error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating item",
    });
  }
};

module.exports = {
  createLostFound,
  getLostFound,
  getLostFoundById,
  updateLostFound,
};
