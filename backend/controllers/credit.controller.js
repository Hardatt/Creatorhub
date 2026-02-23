/**
 * Credit Controller
 * Exposes credit balance and history to users.
 */
const { Users, CreditHistories } = require("@models");

// ── Get balance ───────────────────────────────────────────────────────────────
exports.getBalance = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: ["id", "username", "credits"],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ credits: user.credits });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ── Get history ───────────────────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await CreditHistories.findAndCountAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      history: rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
