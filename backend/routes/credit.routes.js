const router = require("express").Router();
const creditCtrl = require("@controllers/credit.controller");
const { authenticate } = require("@middlewares/auth.middleware");

router.use(authenticate);

// GET /api/credits/balance
router.get("/balance", creditCtrl.getBalance);

// GET /api/credits/history
router.get("/history", creditCtrl.getHistory);

module.exports = router;
