


const bcrypt = require("bcrypt");
const { Users } = require("@models");
const { generateToken } = require("@utils/generatetoken");
const { awardDailyLogin } = require("@services/credit.service");
const { ActivityLogs } = require("@models");


exports.register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    const existing = await Users.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await Users.create({
      username,
      email,
      password: hashed,
      name: name || null,
      role: "user",
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: sanitize(user),
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    
    const loginBonus = await awardDailyLogin(user);

    
    await ActivityLogs.create({
      userId: user.id,
      action: "login",
      metadata: { loginBonus },
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitize(user),
      loginBonus,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.me = async (req, res) => {
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


function sanitize(user) {
  const { password, ...safe } = user.toJSON();
  return safe;
}
