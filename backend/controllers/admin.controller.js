


const { Op } = require("sequelize");
const {
  Users,
  CreditHistories,
  Reports,
  SavedPosts,
  ActivityLogs,
} = require("@models");
const { adjustCredits } = require("@services/credit.service");


exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Users.findAndCountAll({
      attributes: { exclude: ["password"] },
      order: [["credits", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      users: rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.adjustUserCredits = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(422).json({ error: "amount and reason are required" });
    }

    const type = amount >= 0 ? "earn" : "deduct";
    const { newBalance, history } = await adjustCredits(
      parseInt(userId),
      amount,
      type,
      `[Admin] ${reason}`
    );

    return res.json({ message: "Credits adjusted", newBalance, history });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getAllReports = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const reports = await Reports.findAll({
      where,
      include: [{ model: Users, as: "user", attributes: ["id", "username", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ reports });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const report = await Reports.findByPk(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    await report.update({ status });
    return res.json({ message: "Report updated", report });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await ActivityLogs.findAndCountAll({
      include: [{ model: Users, as: "user", attributes: ["id", "username"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      logs: rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getAnalytics = async (req, res) => {
  try {
    
    const topUsers = await Users.findAll({
      attributes: { exclude: ["password"] },
      order: [["credits", "DESC"]],
      limit: 10,
    });

    
    const { sequelize } = require("@models");
    const mostSaved = await SavedPosts.findAll({
      attributes: [
        "postId",
        "title",
        "source",
        "url",
        [sequelize.fn("COUNT", sequelize.col("id")), "saveCount"],
      ],
      group: ["postId", "title", "source", "url"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: 10,
    });

    
    const totalUsers = await Users.count();
    const totalReports = await Reports.count();
    const pendingReports = await Reports.count({ where: { status: "pending" } });
    const totalSaved = await SavedPosts.count();

    return res.json({
      topUsers,
      mostSaved,
      stats: { totalUsers, totalReports, pendingReports, totalSaved },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
