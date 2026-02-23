/**
 * Role Middleware
 * Restricts access to routes based on user role.
 * Must be used AFTER authenticate().
 */

/**
 * @param {...string} roles - allowed roles, e.g. authorise('admin')
 */
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};

module.exports = { authorise };
