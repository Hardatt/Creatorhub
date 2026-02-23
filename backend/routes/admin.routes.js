const router = require("express").Router();
const adminCtrl = require("@controllers/admin.controller");
const { authenticate } = require("@middlewares/auth.middleware");
const { authorise } = require("@middlewares/role.middleware");


router.use(authenticate, authorise("admin"));


router.get("/users", adminCtrl.getAllUsers);


router.patch("/users/:userId/credits", adminCtrl.adjustUserCredits);


router.get("/reports", adminCtrl.getAllReports);


router.patch("/reports/:reportId", adminCtrl.updateReportStatus);


router.get("/logs", adminCtrl.getActivityLogs);


router.get("/analytics", adminCtrl.getAnalytics);

module.exports = router;
