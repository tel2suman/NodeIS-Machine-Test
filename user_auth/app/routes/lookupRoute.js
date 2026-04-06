
const express = require("express");

const LookupController = require("../controllers/LookupController");

const router = express.Router();

// user register

router.get("/category/view", LookupController.CategoryFormView);

router.get("/product/view", LookupController.ProductFormView);

router.post("/create/category", LookupController.CreateCategory);

router.post("/create/product", LookupController.CreateProduct);

router.get("/productlist/view", LookupController.ProductListView);

router.get("/product/with/category", LookupController.GetProductWithCategory);

module.exports = router;