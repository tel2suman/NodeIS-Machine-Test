const express = require("express");

const AdminController = require("../controllers/AdminController");

const EmployeeController = require("../controllers/EmployeeController");

const RefreshTokenAuth = require("../middleware/RequireAuth");

const router = express.Router();

// register view & create
router.get("/signup/view", EmployeeController.signupPage);

router.post("/create/signup", EmployeeController.Signup);

// login view & create
router.get("/admin/login", AdminController.adminLoginPage);

router.post("/admin/login/create", AdminController.adminLogin);

router.use(RefreshTokenAuth);

// get admin dashboard
router.get("/admin/dashboard",
    AdminController.AdminCheckAuth,
    AdminController.adminDashboard
);

// get record
router.get(
  "/edit/data/:id",
  AdminController.AdminCheckAuth,
  AdminController.editAdminData,
);

// update record
router.post(
  "/update/data/:id",
  AdminController.AdminCheckAuth,
  AdminController.updateAdminData,
);

// update status
router.post(
  "/employee-status/:id",
  AdminController.AdminCheckAuth,
  AdminController.updateStatus,
);

// logout
router.get("/admin/logout", AdminController.adminLogout);


module.exports = router;