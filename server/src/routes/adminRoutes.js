const express = require("express");
const router = express.Router();
const { getBranchesOverview } = require("../controllers/adminController");

router.get("/branches-overview", getBranchesOverview);

module.exports = router;