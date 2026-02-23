const router = require("express").Router();
const adminCtrl = require("@controllers/admin.controller");
const { authenticate } = require("@middlewares/auth.middleware");
const { authorise } = require("@middlewares/role.middleware");

// All admin routes require a valid token AND admin role
router.use(authenticate, authorise("admin"));

// GET  /api/admin/users
router.get("/users", adminCtrl.getAllUsers);

// PATCH /api/admin/users/:userId/credits
router.patch("/users/:userId/credits", adminCtrl.adjustUserCredits);

// GET  /api/admin/reports
router.get("/reports", adminCtrl.getAllReports);

// PATCH /api/admin/reports/:reportId
router.patch("/reports/:reportId", adminCtrl.updateReportStatus);

// GET  /api/admin/logs
router.get("/logs", adminCtrl.getActivityLogs);

// GET  /api/admin/analytics
router.get("/analytics", adminCtrl.getAnalytics);

module.exports = router;
