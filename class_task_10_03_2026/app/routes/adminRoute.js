
const express = require("express");

const AdminController = require("../controllers/AdminController");

const AdminAuthCheck = require("../middleware/AdminAuthCheck");


const router = express.Router();

// register view & create
router.get("/signup/view", AdminController.signupPage);

router.post("/create/signup", AdminController.Signup);

// login view & create
router.get("/login/view", AdminController.loginPage);

router.post("/create/login", AdminController.empLogin);


router.use(AdminAuthCheck);

router.get("/change-pass/view", AdminController.passChange);

router.post("/create/change-password", AdminController.EmpChangePassword);

// user dashboard
router.get("/dashboard", AdminController.UserCheckAuth, AdminController.dashboard);

// logout
router.get("/logout", AdminController.logoutUser);


module.exports = router;