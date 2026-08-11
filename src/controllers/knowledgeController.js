const Knowledge = require("../models/Knowledge");

// =====================================================
// CREATE KNOWLEDGE
// ADMIN ONLY
// =====================================================

const createKnowledge = async (req, res) => {
  try {
    const {
      title,
      question,
      answer,
      category,
      department,
      keywords,
      sourceTitle,
      sourceUrl,
      lastVerified,
    } = req.body;

    if (!title || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Title, question and answer are required",
      });
    }

    const allowedCategories = [
      "ACADEMICS",
      "ADMISSIONS",
      "ADMINISTRATION",
      "CAMPUS",
      "FACILITIES",
      "HOSTEL",
      "LIBRARY",
      "EXAM",
      "FEES",
      "TRANSPORT",
      "HEALTH",
      "SPORTS",
      "EVENTS",
      "CONTACTS",
      "GENERAL",
    ];

    const normalizedCategory = (
      category || "GENERAL"
    ).toUpperCase();

    if (!allowedCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid knowledge category",
      });
    }

    const normalizedKeywords = Array.isArray(keywords)
      ? keywords
          .map((keyword) => String(keyword).trim().toLowerCase())
          .filter(Boolean)
      : [];

    let verifiedDate = Date.now();

    if (lastVerified) {
      const parsedDate = new Date(lastVerified);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid lastVerified date",
        });
      }

      verifiedDate = parsedDate;
    }

    const knowledge = await Knowledge.create({
      title: title.trim(),
      question: question.trim(),
      answer: answer.trim(),
      category: normalizedCategory,
      campus: "VIJAYAWADA",
      department: department
        ? department.trim()
        : "ALL",
      keywords: normalizedKeywords,
      sourceTitle: sourceTitle
        ? sourceTitle.trim()
        : "Official KL University Website",
      sourceUrl: sourceUrl
        ? sourceUrl.trim()
        : "https://www.kluniversity.in/",
      lastVerified: verifiedDate,
      isPublished: true,
      createdBy: req.user.id,
    });

    const populatedKnowledge = await Knowledge.findById(
      knowledge._id
    ).populate(
      "createdBy",
      "name email studentId department role"
    );

    return res.status(201).json({
      success: true,
      message: "Knowledge created successfully",
      knowledge: populatedKnowledge,
    });
  } catch (error) {
    console.error("Create knowledge error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating knowledge",
    });
  }
};

// =====================================================
// GET PUBLISHED KNOWLEDGE
// STUDENTS + ADMIN
// =====================================================

const getKnowledge = async (req, res) => {
  try {
    const {
      category,
      department,
      search,
    } = req.query;

    const filter = {
      campus: "VIJAYAWADA",
      isPublished: true,
    };

    if (category) {
      const normalizedCategory =
        category.toUpperCase();

      filter.category = normalizedCategory;
    }

    if (department) {
      filter.department = department.trim();
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
          question: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          answer: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          keywords: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const knowledge = await Knowledge.find(filter)
      .populate(
        "createdBy",
        "name email studentId department role"
      )
      .sort({
        category: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: knowledge.length,
      knowledge,
    });
  } catch (error) {
    console.error("Get knowledge error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching knowledge",
    });
  }
};

// =====================================================
// GET ALL KNOWLEDGE
// ADMIN ONLY
// Includes unpublished records
// =====================================================

const getAllKnowledge = async (req, res) => {
  try {
    const {
      category,
      department,
      isPublished,
      search,
    } = req.query;

    const filter = {
      campus: "VIJAYAWADA",
    };

    if (category) {
      filter.category =
        category.toUpperCase();
    }

    if (department) {
      filter.department = department.trim();
    }

    if (isPublished !== undefined) {
      if (isPublished === "true") {
        filter.isPublished = true;
      } else if (isPublished === "false") {
        filter.isPublished = false;
      } else {
        return res.status(400).json({
          success: false,
          message:
            "isPublished must be true or false",
        });
      }
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
          question: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          answer: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          keywords: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    const knowledge = await Knowledge.find(filter)
      .populate(
        "createdBy",
        "name email studentId department role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: knowledge.length,
      knowledge,
    });
  } catch (error) {
    console.error(
      "Get all knowledge error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching all knowledge",
    });
  }
};

// =====================================================
// GET KNOWLEDGE BY ID
// =====================================================

const getKnowledgeById = async (req, res) => {
  try {
    const knowledge = await Knowledge.findOne({
      _id: req.params.id,
      campus: "VIJAYAWADA",
    }).populate(
      "createdBy",
      "name email studentId department role"
    );

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
    }

    if (
      !knowledge.isPublished &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
    }

    return res.status(200).json({
      success: true,
      knowledge,
    });
  } catch (error) {
    console.error(
      "Get knowledge by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching knowledge item",
    });
  }
};

// =====================================================
// UPDATE KNOWLEDGE
// ADMIN ONLY
// =====================================================

const updateKnowledge = async (req, res) => {
  try {
    const knowledge = await Knowledge.findOne({
      _id: req.params.id,
      campus: "VIJAYAWADA",
    });

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
    }

    const {
      title,
      question,
      answer,
      category,
      department,
      keywords,
      sourceTitle,
      sourceUrl,
      lastVerified,
      isPublished,
    } = req.body;

    if (title !== undefined) {
      knowledge.title = title.trim();
    }

    if (question !== undefined) {
      knowledge.question = question.trim();
    }

    if (answer !== undefined) {
      knowledge.answer = answer.trim();
    }

    if (category !== undefined) {
      const allowedCategories = [
        "ACADEMICS",
        "ADMISSIONS",
        "ADMINISTRATION",
        "CAMPUS",
        "FACILITIES",
        "HOSTEL",
        "LIBRARY",
        "EXAM",
        "FEES",
        "TRANSPORT",
        "HEALTH",
        "SPORTS",
        "EVENTS",
        "CONTACTS",
        "GENERAL",
      ];

      const normalizedCategory =
        category.toUpperCase();

      if (
        !allowedCategories.includes(
          normalizedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid knowledge category",
        });
      }

      knowledge.category = normalizedCategory;
    }

    if (department !== undefined) {
      knowledge.department =
        department.trim();
    }

    if (keywords !== undefined) {
      if (!Array.isArray(keywords)) {
        return res.status(400).json({
          success: false,
          message: "Keywords must be an array",
        });
      }

      knowledge.keywords = keywords
        .map((keyword) =>
          String(keyword)
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);
    }

    if (sourceTitle !== undefined) {
      knowledge.sourceTitle =
        sourceTitle.trim();
    }

    if (sourceUrl !== undefined) {
      knowledge.sourceUrl =
        sourceUrl.trim();
    }

    if (lastVerified !== undefined) {
      const parsedDate = new Date(lastVerified);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid lastVerified date",
        });
      }

      knowledge.lastVerified = parsedDate;
    }

    if (isPublished !== undefined) {
      knowledge.isPublished = Boolean(
        isPublished
      );
    }

    await knowledge.save();

    const populatedKnowledge =
      await Knowledge.findById(
        knowledge._id
      ).populate(
        "createdBy",
        "name email studentId department role"
      );

    return res.status(200).json({
      success: true,
      message: "Knowledge updated successfully",
      knowledge: populatedKnowledge,
    });
  } catch (error) {
    console.error(
      "Update knowledge error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating knowledge",
    });
  }
};

// =====================================================
// DELETE KNOWLEDGE
// ADMIN ONLY
// =====================================================

const deleteKnowledge = async (req, res) => {
  try {
    const knowledge = await Knowledge.findOneAndDelete({
      _id: req.params.id,
      campus: "VIJAYAWADA",
    });

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Knowledge deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete knowledge error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting knowledge",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createKnowledge,
  getKnowledge,
  getAllKnowledge,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
};