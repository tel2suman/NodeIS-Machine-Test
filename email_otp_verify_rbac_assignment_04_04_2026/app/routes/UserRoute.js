
const express = require("express");

const UserController = require("../controllers/UserController");

const authChek = require("../middleware/authCheck");

const router = express.Router();

router.post("/user-register", UserController.registerUser);

router.post("/user-verify", UserController.verifyUser);

router.post("/user-login", UserController.loginUser);

router.use(authChek);

router.get("/user-dashboard", UserController.userDashboard);

module.exports = router;