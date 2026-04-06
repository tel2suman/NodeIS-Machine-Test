
const express = require("express");

const router = express.Router();

//defining routes
const authRoute = require("./authRoute");

const blogRoute = require('./blogRoute');

const lookupRoute = require('./lookupRoute');

router.use(authRoute);

router.use(blogRoute);

router.use(lookupRoute);


module.exports = router;