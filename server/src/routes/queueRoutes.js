const express = require("express");
const router = express.Router();

const {
  joinQueue,
  getQueueStatus,
  callNextToken,
  completeToken,
  markNoShow,
  getCurrentServingToken,
  getDisplayBoardData,
  getCustomerTokenStatus,
  getDisplayData, // ✅ correct add
} = require("../controllers/queueController");

// ================= ROUTES =================

router.get("/customer-status", getCustomerTokenStatus);

router.post("/join", joinQueue);

router.get("/status/:tokenId", getQueueStatus);

router.post("/call-next", callNextToken);

router.post("/complete", completeToken);

router.post("/no-show", markNoShow);

router.get("/current/:branchId", getCurrentServingToken);

router.get("/display-board/:branchId", getDisplayBoardData);

// ✅ NEW DISPLAY API
router.get("/display/:branchId", getDisplayData);

module.exports = router;