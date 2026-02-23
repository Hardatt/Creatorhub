/**
 * Feed Controller
 * Returns the aggregated, cached feed.
 */
const { getUnifiedFeed, invalidateFeedCache } = require("@services/feed.service");

// ── Get feed ──────────────────────────────────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const { source, page = 1, limit = 20 } = req.query;

    let posts = await getUnifiedFeed();

    // Optional source filter
    if (source) {
      posts = posts.filter((p) => p.source === source);
    }

    // Pagination
    const total = posts.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = posts.slice(start, start + parseInt(limit));

    return res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      posts: paginated,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── Refresh feed (bust cache) ─────────────────────────────────────────────────
exports.refreshFeed = async (req, res) => {
  try {
    await invalidateFeedCache();
    const posts = await getUnifiedFeed();
    return res.json({ message: "Feed refreshed", total: posts.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
