
const express = require("express");

const ProductController = require("../controllers/ProductController");

const router = express.Router();


const productRoute = require("./ProductRoute.js");




router.use("/api/opr", productRoute);


module.exports = router;

