


const { SavedPosts, ActivityLogs } = require("@models");
const { awardInteraction } = require("@services/credit.service");


exports.savePost = async (req, res) => {
  try {
    const { postId, title, content, source, url, author, thumbnail, upvotes } =
      req.body;

    const [saved, created] = await SavedPosts.findOrCreate({
      where: { userId: req.user.id, postId },
      defaults: { title, content, source, url, author, thumbnail, upvotes },
    });

    if (!created) {
      return res.status(409).json({ error: "Post already saved" });
    }

    
    const { newBalance } = await awardInteraction(req.user.id, "save_post");

    await ActivityLogs.create({
      userId: req.user.id,
      action: "save_post",
      metadata: { postId, title, source },
    });

    return res.status(201).json({ message: "Post saved", saved, newBalance });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const deleted = await SavedPosts.destroy({
      where: { userId: req.user.id, postId },
    });

    if (!deleted) {
      return res.status(404).json({ error: "Saved post not found" });
    }

    return res.json({ message: "Post removed from saved" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await SavedPosts.findAndCountAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      posts: rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.sharePost = async (req, res) => {
  try {
    const { postId, title, source, url } = req.body;

    const { newBalance } = await awardInteraction(req.user.id, "share_post");

    await ActivityLogs.create({
      userId: req.user.id,
      action: "share_post",
      metadata: { postId, title, source, url },
    });

    return res.json({ message: "Share logged", newBalance });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
