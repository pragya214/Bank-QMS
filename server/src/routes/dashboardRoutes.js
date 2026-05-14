const express = require("express");
const router = express.Router();

const { getDashboardSummary } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
  "/summary/:branchId",
  authMiddleware,
  roleMiddleware("admin"),
  getDashboardSummary
);

module.exports = router;