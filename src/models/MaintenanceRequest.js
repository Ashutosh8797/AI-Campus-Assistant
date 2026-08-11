const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema(
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
      enum: [
        "ELECTRICAL",
        "PLUMBING",
        "CLEANING",
        "HOSTEL",
        "CLASSROOM",
        "FURNITURE",
        "INTERNET",
        "OTHER",
      ],
      default: "OTHER",
    },

    location: {
      type: String,
      required: true,
      trim: true,
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

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "RESOLVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "MaintenanceRequest",
  maintenanceRequestSchema
);