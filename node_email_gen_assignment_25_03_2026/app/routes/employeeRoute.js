
const express = require("express");

const EmployeeController = require("../controllers/EmployeeController");

const RefreshTokenAuth = require("../middleware/RequireAuth");

const router = express.Router();

// register view & create
router.get("/signup/view", EmployeeController.signupPage);

router.post("/create/signup", EmployeeController.Signup);

// login view & create
router.get("/login/view", EmployeeController.loginPage);

router.post("/create/login", EmployeeController.empLogin);

router.use(RefreshTokenAuth);

router.get(
  "/change-pass/view",
  EmployeeController.UserCheckAuth,
  EmployeeController.passChange,
);

router.post(
  "/create/change-password",
  EmployeeController.UserCheckAuth,
  EmployeeController.EmpChangePassword,
);

// user dashboard
router.get("/dashboard",
    EmployeeController.UserCheckAuth,
    EmployeeController.dashboard
);

// logout
router.get("/logout", EmployeeController.logoutUser);


module.exports = router;