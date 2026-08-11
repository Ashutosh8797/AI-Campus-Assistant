const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
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

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["LOST", "FOUND"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "ID_CARD",
        "BOOK",
        "ELECTRONICS",
        "CLOTHING",
        "KEYS",
        "DOCUMENT",
        "OTHER",
      ],
      default: "OTHER",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLAIMED", "CLOSED"],
      default: "OPEN",
    },

    contactInfo: {
      type: String,
      required: true,
      trim: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);
