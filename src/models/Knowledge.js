const mongoose = require("mongoose");

const knowledgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "ACADEMICS",
        "ADMINISTRATION",
        "FACILITIES",
        "HOSTEL",
        "LIBRARY",
        "EXAM",
        "FEES",
        "TRANSPORT",
        "GENERAL",
      ],
      default: "GENERAL",
    },

    department: {
      type: String,
      trim: true,
      default: "ALL",
    },

    keywords: {
      type: [String],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Knowledge", knowledgeSchema);