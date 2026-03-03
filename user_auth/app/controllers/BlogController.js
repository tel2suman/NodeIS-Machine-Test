
const BlogPost = require("../models/blog");

const jwt = require("jsonwebtoken");

const cloudinary = require("../config/cloudinary");

const fs = require("fs");

const StatusCode = require("../utils/StatusCode");

class BlogController {
  //create post
  async createPost(req, res) {
    try {
      const { title, content } = req.body;

      //validate all fields
      if (!title || !content) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "fields are required",
        });
      }

      const existPost = await BlogPost.findOne({ title });

      if (existPost) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "post already exist",
        });
      }

      //upload to clodinary
      const imageResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
        width: 500,
        height: 500,
        crop: "limit",
        quality: "auto",
      });

      // Delete local file after upload (important)
      if (req.file && req.file.path) {
        await fs.promises.unlink(req.file.path);
      }

      const postdata = new BlogPost({
        title,
        content,
        author: req.user._id,
        cover_image: imageResult ? imageResult.secure_url : null,
        cloudinary_id: imageResult ? imageResult.public_id : null,
      });

      const data = await postdata.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "post created successfully",
        data: data,
      });
    } catch (error) {
      // cleanup local file if error happens
      if (req.file && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }

      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // get all posts
  async getAllPost(req, res) {
    try {
      const data = await BlogPost.find({ is_delete: false });

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "all the posts are here",
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

  // get single posts
  async getSinglePost(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, post id required!",
        });
      }

      const data = await BlogPost.findById(id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "get this post",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //update post
  async updatePost(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "post id is required",
        });
      }

      const bloguser = await BlogPost.findById(id);

      if (!bloguser) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Blog not found",
        });
      }

      //ownership check
      if (bloguser.author !== req.user._id) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "owner can only update his your own post",
        });
      }

      // Handle Cloudinary image
      if (req.file) {
        // delete existing image
        if (bloguser.cloudinary_id) {
          await cloudinary.uploader.destroy(bloguser.cloudinary_id);
        }

        // upload new image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "uploads",
          width: 500,
          height: 500,
          crop: "limit",
          quality: "auto",
        });

        bloguser.cover_image = result.secure_url;
        bloguser.cloudinary_id = result.public_id;

        // Delete local file
        await fs.promises.unlink(req.file.path);
      }

      // Handle Data Update
      if (req.body.title !== undefined) {
        bloguser.title = req.body.title;
      }

      if (req.body.content !== undefined) {
        bloguser.content = req.body.content;
      }

      //updated user
      const updatedBlog = await bloguser.save();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Blog updated successfully",
        data: updatedBlog,
      });
    } catch (error) {
      // cleanup local file if error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }

      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  // soft delete post
  async softdeletePost(req, res) {

    try {

      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "post id is required",
        });
      }

      const data = await BlogPost.findByIdAndUpdate(id,
        {author: req.user._id},
        { is_delete: true },
        { new: true },
      );

      if (!data) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "owner can only delete his own post",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: " post soft delete done successfully",
        data: data,
      });

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // hard delete post
  async deletePost(req, res) {

    try {

      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "post id is required",
        });
      }

      const data = await BlogPost.findByIdAndDelete(id);

      if (!data) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "owner can only delete his own post",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: " post deleted successfully",
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

module.exports = new BlogController();