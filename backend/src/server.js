const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const knowledgeRoutes = require("./routes/knowledgeRoutes");
const assistantRoutes = require("./routes/assistantRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const safetyRoutes = require("./routes/safetyRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const helpRequestRoutes = require("./routes/helpRequestRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use(
  "/uploads",
  express.static(
    require("path").join(
      __dirname,
      "../uploads"
    )
  )
);

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/safety", safetyRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/help-requests", helpRequestRoutes);

// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Campus Assistant API is running",
  });
});

// ==========================================
// DATABASE
// ==========================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed");
    console.error(error.message);
  });

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});