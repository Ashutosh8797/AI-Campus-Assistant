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
      ],
      default: "GENERAL",
    },

    campus: {
      type: String,
      enum: ["VIJAYAWADA"],
      default: "VIJAYAWADA",
      required: true,
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

    sourceTitle: {
      type: String,
      default: "Official KL University Website",
      trim: true,
    },

    sourceUrl: {
      type: String,
      default: "https://www.kluniversity.in/",
      trim: true,
    },

    lastVerified: {
      type: Date,
      default: Date.now,
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