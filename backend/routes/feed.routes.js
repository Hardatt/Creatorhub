const router = require("express").Router();
const feedCtrl = require("@controllers/feed.controller");
const { authenticate } = require("@middlewares/auth.middleware");

router.use(authenticate);

// GET  /api/feed          - paginated, filterable by ?source=reddit|twitter|linkedin
router.get("/", feedCtrl.getFeed);

// POST /api/feed/refresh  - bust cache and re-fetch
router.post("/refresh", feedCtrl.refreshFeed);

module.exports = router;
