
const Product = require("../models/product");

const StatusCode = require("../utils/StatusCode");

class ProductController {
  // create product
  async createProduct(req, res) {
    try {
      const { name, description, price, category } = req.body;

      if (!name || !description || !price || !category) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const data = new Product({
        name,
        description,
        price,
        category,
      });

      const product = await data.save();

      // Your record creation logic here
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Product created successfully.",
        data: product,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // view product
  async viewProduct(req, res) {
    try {
      const data = await Product.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "all products are here",
        total: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // single product
  async viewSingleProduct(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, product id required!",
        });
      }

      const data = await Product.findById(id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "selected product is here",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // update product
  async updateProduct(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, product id required!",
        });
      }

      const data = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      // Handle logic
      res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "product updated successfully",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // delete product
  async deleteProduct(req, res) {

    try {

      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, product id required!",
        });
      }

      const data = await Product.findByIdAndDelete(id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "product deleted succesfully",
        data: data,
      });

    } catch (error) {

      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new ProductController();