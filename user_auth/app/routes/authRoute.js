
const express = require("express");

const validateRegister = require("../utils/UserSchemaValidation");

const AuthController = require("../controllers/AuthController");

const Upload = require("../utils/CloudinaryImageUpload");

const authCheck = require("../middleware/auth");

const router = express.Router();

// user register
router.get("/register", AuthController.registerPage);

router.post("/register", Upload.single("image"), validateRegister, AuthController.registerUser);

// user login
router.get("/login", AuthController.loginPage);

router.post("/login", AuthController.loginUser);

router.use(authCheck);

// get user profile
router.get("/profile", AuthController.userProfile);

// get edit profile
router.get("/edit/profile", AuthController.editProfile);

// user profile update
router.post("/update/profile", Upload.single("image"), AuthController.updateProfile);

router.get("/logout", AuthController.logoutUser);

// cloudinary image upload
router.post("/upload-file", Upload.single("image"), AuthController.cloudUpload);


module.exports = router;