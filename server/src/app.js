const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const queueRoutes = require("./routes/queueRoutes");
const branchRoutes = require("./routes/branchRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const counterRoutes = require("./routes/counterRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const auditRoutes = require("./routes/auditRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Bank QMS API is running" });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/queue", queueRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/counters", counterRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/settings", settingsRoutes);

module.exports = app;