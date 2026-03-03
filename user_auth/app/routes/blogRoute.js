
const express = require("express");

const BlogController = require('../controllers/BlogController');

const Upload = require("../utils/CloudinaryImageUpload");

const authCheck = require("../middleware/auth");

const router = express.Router();

// get all posts
router.get("/posts", BlogController.getAllPost);

// get single post
router.get("/post/:id", BlogController.getSinglePost)

router.use(authCheck);

// create post
router.post("/create/post", Upload.single("cover_image"), BlogController.createPost);

// update post
router.put("/update/post/:id", Upload.single("cover_image"), BlogController.updatePost);

// soft delete post
router.delete("/softdelete/post/:id", BlogController.softdeletePost);

// delete post
router.delete("/delete/post/:id", BlogController.deletePost);

module.exports = router;
