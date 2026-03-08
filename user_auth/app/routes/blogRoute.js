
const express = require("express");

const BlogController = require('../controllers/BlogController');

const Upload = require("../utils/CloudinaryImageUpload");

const authCheck = require("../middleware/auth");

const router = express.Router();

// get all posts
router.get("/posts", BlogController.getAllPost);


router.use(authCheck);

// post page
router.get("/post/add", BlogController.addPost);

// get single post
router.get("/post/:id", BlogController.getSinglePost);

// get single post
router.get("/edit/post/:id", BlogController.editPost);

// create post
router.post("/create/post", Upload.single("cover_image"), BlogController.createPost);

// update post
router.post("/update/post/:id", Upload.single("cover_image"), BlogController.updatePost);

// soft delete post
router.get("/softdelete/post/:id", BlogController.softdeletePost);

// delete post
router.get("/delete/post/:id", BlogController.deletePost);

module.exports = router;
