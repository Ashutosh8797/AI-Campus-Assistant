const mongoose = require("mongoose");

const safetySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "EMERGENCY",
        "SECURITY",
        "FIRE",
        "MEDICAL",
        "HARASSMENT",
        "ACCIDENT",
        "OTHER",
      ],
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "HIGH",
    },

    status: {
      type: String,
      enum: [
        "REPORTED",
        "INVESTIGATING",
        "RESOLVED",
        "REJECTED",
      ],
      default: "REPORTED",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolutionNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Safety", safetySchema);