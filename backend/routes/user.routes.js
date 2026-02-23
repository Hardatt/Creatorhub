const router = require("express").Router();
const userCtrl = require("@controllers/user.controller");
const { authenticate } = require("@middlewares/auth.middleware");

// All routes require authentication
router.use(authenticate);

// GET  /api/users/profile
router.get("/profile", userCtrl.getProfile);

// PUT  /api/users/profile
router.put("/profile", userCtrl.updateProfile);

// GET  /api/users/activity
router.get("/activity", userCtrl.getActivity);

module.exports = router;
