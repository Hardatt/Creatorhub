const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("@models");
const generatetoken  = require("@utils/generatetoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashed,
    });
    res.status(201).json({ "User Created": user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
