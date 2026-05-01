const express = require("express");

const router = express.Router();

//defining routes
const UserRoute = require("./UserRoute");

const TaskRoute = require("./TaskRoute");

router.use(UserRoute);

router.use(TaskRoute);

module.exports = router;
