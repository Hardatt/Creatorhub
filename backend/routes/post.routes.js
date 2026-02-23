const router = require("express").Router();
const { body } = require("express-validator");
const postCtrl = require("@controllers/post.controller");
const { authenticate } = require("@middlewares/auth.middleware");
const { validate } = require("@middlewares/validate.middleware");

router.use(authenticate);

// GET    /api/posts/saved
router.get("/saved", postCtrl.getSavedPosts);

// POST   /api/posts/save
router.post(
  "/save",
  [
    body("postId").notEmpty().withMessage("postId required"),
    body("title").notEmpty().withMessage("title required"),
    body("source").notEmpty().withMessage("source required"),
    body("url").isURL().withMessage("valid url required"),
  ],
  validate,
  postCtrl.savePost
);

// DELETE /api/posts/save/:postId
router.delete("/save/:postId", postCtrl.unsavePost);

// POST   /api/posts/share
router.post(
  "/share",
  [body("postId").notEmpty(), body("source").notEmpty()],
  validate,
  postCtrl.sharePost
);

module.exports = router;
