
const User = require("../models/user");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const cloudinary = require("../config/cloudinary");

const fs = require("fs");

//const StatusCode = require("../utils/StatusCode");

class AuthController {

  // Register page
  async registerPage(req, res) {
    res.render("register", {
      title: "Register Page",
    });
  }

  // Login page
  async loginPage(req, res) {
    res.render("login", {
      title: "Login Page",
    });
  }

  // User registration
  async registerUser(req, res) {
    
    try {

      const { name, email, password, about } = req.body;

      //validate all fields
      if (!name || !email || !password || !about) {
        return res.redirect("/register");
      }

      const existUser = await User.findOne({ email });

      if (existUser) {
        return res.render("register", {
          title: "Register Page",
          message: "User already exists"
        });
      }

      //bcrypt function
      const salt = await bcrypt.genSalt(6);
      const hashedpassword = await bcrypt.hash(password, salt);

      //cloudinary upload
      if (!req.file) {
        return res.render("register", {
          title: "Register Page",
          message: "image not uploaded!!",
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
        fs.promises.unlink(req.file.path);
      }

      const userdata = new User({
        name,
        email,
        password: hashedpassword,
        about,
        image: imageResult ? imageResult.secure_url : null,
        cloudinary_id: imageResult ? imageResult.public_id : null,
      });

      const data = await userdata.save();

      if (data) {
        res.redirect("/login");
      } else {
        res.redirect("/register");
      }
    } catch (error) {
      res.send(error.message);
    }
  }

  //User login
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.redirect("/login");
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.redirect("/login");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.redirect("/login");
      }

      if (user && user.is_admin == "user") {

        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" });

        // store token in session or cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: false,
        });

        return res.redirect("/posts");

      } else {
        res.send(error.message);
      }
    } catch (error) {
      res.send(error.message);
    }
  }

  // logout user
  async logoutUser(req, res) {

    try {
      // clear cookie
      res.clearCookie("token");

      return res.redirect("/login");

    } catch (error) {
      res.send(error.message);
    }
  }

  //User profile
  async userProfile(req, res) {

    try {

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.render("profile", {
          title: "Profile Not Found",
          data: null,
        });
      }

      res.render("profile", {
        title: "Profile Page",
        data: user,
      });
    } catch (error) {
      return res.send(error.message);
    }
  }

  //edit profile
  async editProfile(req, res) {

    try {

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.redirect("/profile");
      }

      res.render("edit_user", {
        title: "Edit User Profile",
        data: user,
      });

    } catch (error) {
       return res.send(error.message);
    }
  }

  //update user profile
  async updateProfile(req, res) {

    try {

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.redirect("/edit_user");
      }

      if (
        !req.body.name &&
        !req.body.email &&
        !req.body.password &&
        !req.body.about &&
        !req.file
      ) {
        return res.redirect("/edit_user");
      }

      // Handle Cloudinary image
      if (req.file) {

        // upload new image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "uploads",
          width: 500,
          height: 500,
          crop: "limit",
          quality: "auto",
        });

        // delete existing image
        if (user.cloudinary_id) {
          await cloudinary.uploader.destroy(user.cloudinary_id);
        }
        user.image = result.secure_url;
        user.cloudinary_id = result.public_id;

        // Delete local file
        await fs.promises.unlink(req.file.path);
      }

      // Handle Data Update
      if (req.body.name !== undefined) {
        user.name = req.body.name;
      }

      //safe email check
      if (req.body.email && req.body.email !== user.email) {
        const existEmail = await User.findOne({ email: req.body.email });
        if (existEmail) {
          return res.redirect("/edit_user");
        }
        // updated email
        user.email = req.body.email;
      }

      // password hashing with bcrypt
      if (req.body.password && req.body.password.trim() !== "") {
        //password length must be 6 charcters
        if (req.body.password.length < 6) {
          return res.redirect("/edit_user");
        }
        //password hashing with bcrypt
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      if (req.body.about !== undefined) {
        user.about = req.body.about;
      }

      //updated user
      const updatedUser = await user.save();

      res.render("profile", {
        success: true,
        title: "Profile Page",
        message: "Profile updated successfully",
        data: updatedUser,
      });

    } catch (error) {
      // cleanup local file if error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        await fs.promises.unlink(req.file.path);
      }
       res.redirect("/edit_user?error=" + error.message);
    }
  }

  // Image Upload
  async cloudUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      //upload to clodinary
      const data = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
        width: 500,
        height: 500,
        crop: "limit",
        quality: "auto",
      });

      // Delete local file after upload (important)
      fs.unlinkSync(req.file.path);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Cloudinary Image uploaded successfull!!",
        image: data.secure_url,
        cloudinary_id: data.public_id,
      });
    } catch (error) {
      // Delete file if exists (in case upload failed)
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}



module.exports = new AuthController();