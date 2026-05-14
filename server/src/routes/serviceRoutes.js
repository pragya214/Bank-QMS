const express = require("express");
const router = express.Router();

const {
  getServicesByBranch,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/:branchId", getServicesByBranch);

router.post("/", authMiddleware, createService);
router.put("/:id", authMiddleware, updateService);
router.delete("/:id", authMiddleware, deleteService);

module.exports = router;