const router = require("express").Router();
const { body } = require("express-validator");
const reportCtrl = require("@controllers/report.controller");
const { authenticate } = require("@middlewares/auth.middleware");
const { validate } = require("@middlewares/validate.middleware");

router.use(authenticate);

// POST /api/reports
router.post(
  "/",
  [
    body("postId").notEmpty().withMessage("postId required"),
    body("source").notEmpty().withMessage("source required"),
    body("reason").isLength({ min: 5 }).withMessage("reason min 5 chars"),
  ],
  validate,
  reportCtrl.createReport
);

// GET  /api/reports/mine
router.get("/mine", reportCtrl.getMyReports);

module.exports = router;
