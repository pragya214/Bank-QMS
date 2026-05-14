const express = require("express");
const router = express.Router();

const {
  getCountersByBranch,
  createCounter,
  updateCounter,
  toggleCounterStatus,
  deleteCounter,
} = require("../controllers/counterController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createCounter);
router.put("/:id", authMiddleware, updateCounter);
router.patch("/:id/toggle-status", authMiddleware, toggleCounterStatus);
router.delete("/:id", authMiddleware, deleteCounter);

// dynamic route last me
router.get("/:branchId", getCountersByBranch);

module.exports = router;