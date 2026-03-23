
const express = require("express");

const router = express.Router();

const classRoute = require("./userRoute");

const adminRoute = require("./adminRoute");


router.use("/api/class-task", classRoute);

router.use(adminRoute);


module.exports = router;