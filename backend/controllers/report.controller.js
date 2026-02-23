/**
 * Report Controller
 * Users report inappropriate feed posts.
 */
const { Reports, ActivityLogs } = require("@models");
const { awardInteraction } = require("@services/credit.service");

// ── Submit report ─────────────────────────────────────────────────────────────
exports.createReport = async (req, res) => {
  try {
    const { postId, title, source, url, reason } = req.body;

    const report = await Reports.create({
      userId: req.user.id,
      postId,
      title,
      source,
      url,
      reason,
    });

    // Award interaction credit
    const { newBalance } = await awardInteraction(req.user.id, "report_post");

    await ActivityLogs.create({
      userId: req.user.id,
      action: "report_post",
      metadata: { postId, title, source, reason },
    });

    return res.status(201).json({ message: "Report submitted", report, newBalance });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── Get user's own reports ────────────────────────────────────────────────────
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Reports.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    return res.json({ reports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
