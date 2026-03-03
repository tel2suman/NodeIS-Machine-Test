
const express = require("express");

const validateRegister = require("../utils/UserSchemaValidation");

const AuthController = require("../controllers/AuthController");

const Upload = require("../utils/CloudinaryImageUpload");

const authCheck = require("../middleware/auth");

const router = express.Router();

// user register
router.post("/register", Upload.single("image"), validateRegister, AuthController.registerUser);
// user login
router.post("/login", AuthController.loginUser);


router.use(authCheck);

// cloudinary image upload
router.post("/upload-file", Upload.single("image"), AuthController.cloudUpload);
// get user profile
router.get("/profile", AuthController.userProfile);
// user profile update
router.put("/update/:id", Upload.single("image"), AuthController.updateProfile);

module.exports = router;