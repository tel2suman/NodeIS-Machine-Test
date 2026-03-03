
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BlogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    cover_image: {
      type: String,
      default: "default.jpeg",
    },

    cloudinary_id: {
      type: String,
      default: null,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    is_delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const BlogModel = mongoose.model("blog", BlogSchema);

module.exports = BlogModel;