const router = require("express").Router();
const userCtrl = require("@controllers/user.controller");
const { authenticate } = require("@middlewares/auth.middleware");


router.use(authenticate);


router.get("/profile", userCtrl.getProfile);


router.put("/profile", userCtrl.updateProfile);


router.get("/activity", userCtrl.getActivity);

module.exports = router;
