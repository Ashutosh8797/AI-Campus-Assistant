const Knowledge = require("../models/Knowledge");

// Create a knowledge entry
const createKnowledge = async (req, res) => {
  try {
    const {
      title,
      question,
      answer,
      category,
      department,
      keywords,
      isPublished,
    } = req.body;

    if (!title || !question || !answer || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, question, answer and category are required",
      });
    }

    const knowledge = await Knowledge.create({
      title,
      question,
      answer,
      category,
      department: department || "ALL",
      keywords: keywords || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Knowledge entry created successfully",
      knowledge,
    });
  } catch (error) {
    console.error("Create knowledge error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating knowledge",
    });
  }
};

// Get all knowledge entries
const getKnowledge = async (req, res) => {
  try {
    const { category, department, search } = req.query;
    const filter = {};

    if (req.user.role === "STUDENT") {
      filter.isPublished = true;
    }

    if (category) {
      filter.category = category;
    }

    if (department) {
      filter.department = {
        $in: [department, "ALL"],
      };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ];
    }

    const knowledge = await Knowledge.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: knowledge.length,
      knowledge,
    });
  } catch (error) {
    console.error("Get knowledge error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching knowledge",
    });
  }
};

// Get one knowledge entry
const getKnowledgeById = async (req, res) => {
  try {
    const filter = {
      _id: req.params.id,
    };

    if (req.user.role === "STUDENT") {
      filter.isPublished = true;
    }

    const knowledge = await Knowledge.findOne(filter).populate(
      "createdBy",
      "name email role"
    );

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: "Knowledge entry not found",
      });
    }

    res.status(200).json({
      success: true,
      knowledge,
    });
  } catch (error) {
    console.error("Get knowledge by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching knowledge",
    });
  }
};

// Update a knowledge entry
const updateKnowledge = async (req, res) => {
  try {
    const {
      title,
      question,
      answer,
      category,
      department,
      keywords,
      isPublished,
    } = req.body;

    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (question !== undefined) updateFields.question = question;
    if (answer !== undefined) updateFields.answer = answer;
    if (category !== undefined) updateFields.category = category;
    if (department !== undefined) updateFields.department = department;
    if (keywords !== undefined) updateFields.keywords = keywords;
    if (isPublished !== undefined) updateFields.isPublished = isPublished;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const knowledge = await Knowledge.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: "Knowledge entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Knowledge entry updated successfully",
      knowledge,
    });
  } catch (error) {
    console.error("Update knowledge error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating knowledge",
    });
  }
};

// Delete a knowledge entry
const deleteKnowledge = async (req, res) => {
  try {
    const knowledge = await Knowledge.findByIdAndDelete(req.params.id);

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: "Knowledge entry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Knowledge entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete knowledge error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting knowledge",
    });
  }
};

module.exports = {
  createKnowledge,
  getKnowledge,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
};