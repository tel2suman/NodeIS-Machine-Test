
const express = require("express");

const ProductController = require("../controllers/ProductController");

const router = express.Router();

// Create Product
router.post("/create-product", ProductController.createProduct);

// View Product
router.get("/all-product", ProductController.viewProduct);

// Single Product
router.get("/single-product/:id", ProductController.viewSingleProduct);

// Update Product
router.put("/update-product/:id", ProductController.updateProduct);

// Delete Product
router.delete("/delete-product/:id", ProductController.deleteProduct);

module.exports = router;
