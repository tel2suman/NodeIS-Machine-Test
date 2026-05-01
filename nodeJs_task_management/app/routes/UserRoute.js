
const express = require("express");

const UserController = require("../controllers/UserController");

const tokenCheck = require("../middleware/tokenCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.post("/create-user", UserController.createUser);

router.post("/login-user", UserController.loginUser);

router.use(tokenCheck);

router.post("/new-refresh-token", UserController.getRefreshToken);

router.put("/update-status/:userId", UserController.updateUserStatus);

router.post("/logout-user", UserController.logoutUser);


module.exports = router;