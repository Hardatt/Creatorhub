


const { Users } = require("@models");
const { awardProfileComplete } = require("@services/credit.service");
const { ActivityLogs } = require("@models");


exports.getProfile = async (req, res) => {
  try {
    const user = await Users.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await Users.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update({ name, bio, avatar });

    
    let profileBonus = null;
    if (name && bio && avatar && !user.isProfileComplete) {
      profileBonus = await awardProfileComplete(user);
    }

    await ActivityLogs.create({
      userId: user.id,
      action: "profile_update",
      metadata: { profileBonus },
    });

    const { password, ...safe } = user.toJSON();
    return res.json({ message: "Profile updated", user: safe, profileBonus });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getActivity = async (req, res) => {
  try {
    const logs = await ActivityLogs.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
