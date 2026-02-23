const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for the given user.
 * @param {object} user - Sequelize User instance
 * @returns {string} signed token
 */
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};
