const router = require("express").Router();
const creditCtrl = require("@controllers/credit.controller");
const { authenticate } = require("@middlewares/auth.middleware");

router.use(authenticate);


router.get("/balance", creditCtrl.getBalance);


router.get("/history", creditCtrl.getHistory);

module.exports = router;
