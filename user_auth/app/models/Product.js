
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },

    size: [String],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: true,
    },

    createOn: {
      type: Date,
      default: new Date(),
    },

    updateOn: {
      type: Date,
      default: new Date(),
    },
  },
  {
    versionKey: false,
  },
);

const productModel = mongoose.model("product", ProductSchema);

module.exports = productModel;