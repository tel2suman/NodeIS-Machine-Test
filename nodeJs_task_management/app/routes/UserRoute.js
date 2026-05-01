
const express = require("express");

const UserController = require("../controllers/UserController");

const tokenCheck = require("../middleware/tokenCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();


router.post("/create-user", UserController.createUser);

router.post("/login-user", UserController.loginUser);

router.use(tokenCheck);

router.post("/logout-user", UserController.logoutUser);


module.exports = router;