
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    categoryName: {
      type: String,
      required: true,
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

const categoryModel = mongoose.model("category", CategorySchema);

module.exports = categoryModel;