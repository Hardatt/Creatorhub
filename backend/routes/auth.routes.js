const router = require("express").Router();
const { body } = require("express-validator");
const authCtrl = require("@controllers/auth.controller");
const { authenticate } = require("@middlewares/auth.middleware");
const { validate } = require("@middlewares/validate.middleware");


router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3, max: 50 }).withMessage("Username 3-50 chars"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  validate,
  authCtrl.register
);


router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  authCtrl.login
);


router.get("/me", authenticate, authCtrl.me);

module.exports = router;
