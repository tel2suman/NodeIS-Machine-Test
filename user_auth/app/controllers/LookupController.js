
const Category = require("../models/Category");

const Product =  require("../models/Product");

class LookupController {
  // Register Category page
  async CategoryFormView(req, res) {
    res.render("category_form", {
      title: "Category Form Page",
    });
  }

  // Register Product page
  async ProductFormView(req, res) {

    try {

        const categories = await Category.find();

        res.render("product_form", {
            title: "Product Form Page",
            categories,
        });

    } catch (error) {

        console.log(error.message);
    }
  }

  // create category
  async CreateCategory(req, res) {
    try {
      const { categoryName } = req.body;

      if (!categoryName || !categoryName.trim()) {
        return res.redirect("/category/view");
      }

      const existCategory = await Category.findOne({ categoryName });

      if (existCategory) {
        return res.redirect("/category/view");
      }

      const data = await Category.create({ categoryName });

      if (data) {
        res.redirect("/product/view");
      } else {
        res.redirect("/category/view");
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // create product
  async CreateProduct(req, res) {

    try {

      const { productName, productPrice, categoryId, size } = req.body;

      const sizeArray = Array.isArray(size) ? size : size ? [size] : [];

      if (
        !productName ||
        !productPrice ||
        !categoryId ||
        (sizeArray.length === 0)
      ) {

        req.flash("error", "All fields are required");

        return res.redirect("/product/view");
      }

      // Get category details using ID
      const category = await Category.findById(categoryId);

      if (!category) {

        req.flash("error", "Category not found");

        return res.redirect("/product/view");
      }

      const existProduct = await Product.findOne({ productName });

      if (existProduct) {

        return res.redirect("/product/view");
      }

        await Product.create({
            productName,
            productPrice,
            categoryId,
            size: sizeArray,
        });

     req.flash("success", "Product created successfully");

     return res.redirect("/productlist/view");


    } catch (error) {

       console.log(error.message);

       req.flash("error", "Something went wrong");

       return res.redirect("/product/view");
    }
  }

  // Product view page
    async ProductListView(req, res) {

      try {

        const data = await Product.find().populate(
          "categoryId",
          "categoryName",
        );

        res.render("all_product", {
            title: "Product List Page",
            data: data,
        });

      } catch (error) {

          console.log(error.message);

          req.flash("error", "Something went wrong");
      }
    }

  //show product with Category
  async GetProductWithCategory(req, res) {

    try {

      const lookupQuery = [
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $project: {
            productName: 1,
            categoryName: "$category.categoryName",
          },
        },
        {
          $group: {
            _id: "$categoryName",
            products: {
              $push: {
                productName: "$productName",
                productPrice: "$productPrice",
              },
            },
            // total: {
            //   $sum: 1,
            // },
          },
        },
      ];

      const product = await Product.aggregate(lookupQuery);

      res.render("lookup_product", {
        title: "Product List Page",
        data: product,
      });

    } catch (error) {

      console.log(error.message);
    }

  }
}


module.exports = new LookupController;