const express = require("express");
const router = express.Router();

const {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getBranches);

router.post("/", authMiddleware, createBranch);
router.put("/:id", authMiddleware, updateBranch);
router.delete("/:id", authMiddleware, deleteBranch);

module.exports = router;