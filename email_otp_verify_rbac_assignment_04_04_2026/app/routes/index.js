const express = require("express");

const router = express.Router();

const UserRoute = require("./UserRoute");

router.use("/api/user", UserRoute);


module.exports = router;