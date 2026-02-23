const router = require("express").Router();
const feedCtrl = require("@controllers/feed.controller");
const { authenticate } = require("@middlewares/auth.middleware");

router.use(authenticate);


router.get("/", feedCtrl.getFeed);


router.post("/refresh", feedCtrl.refreshFeed);

module.exports = router;
