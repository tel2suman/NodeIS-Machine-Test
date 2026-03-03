
const User = require("../models/user");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const cloudinary = require("../config/cloudinary");

const fs = require("fs");

const StatusCode = require("../utils/StatusCode");

class AuthController {

  // user registration
  async registerUser(req, res) {
      try {
        const { name, email, password, about } = req.body;

        //validate all fields
        if (!name || !email || !password || !about) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "all fields are required",
          });
        }

        const existUser = await User.findOne({ email });

        if (existUser) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "user already exist",
          });
        }

        //bcrypt function
        const salt = await bcrypt.genSalt(6);
        const hashedpassword = await bcrypt.hash(password, salt);

        //cloudinary upload
        if (!req.file) {
          return res.status(StatusCode.BAD_REQUEST).json({
            message: "No Profile image uploaded",
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

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "user registered successfully",
          data: data,
        });

      } catch (error) {
          return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: error.message,
          });
      }
  }

  //user login
  async loginUser(req, res) {

    try {

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user not found",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "password does not match",
        });
      }

      if (user && user.is_admin=="user") {

        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
            image: user.image,
            about: user.about,
          },
          process.env.JWT_SECRET_KEY,{ expiresIn: "1d" })

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "user login successfull!!",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
            image: user.image,
            about: user.about,
          },
          token: token,
        });

      } else {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user not found",
        });
      }

    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  //user profile
  async userProfile(req, res) {

    try {

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "welcome to user profile",
        data: req.user,
      });

    } catch (error) {

      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  //update user profile
  async updateProfile(req, res) {

    try {

      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "user id is required",
        });
      }

      if (req.user._id !== id) {
        return res.status(StatusCode.FORBIDDEN).json({
          success: false,
          message: "You can only update your own profile",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Handle Cloudinary image
      if (req.file) {
        // delete existing image
        if (user.cloudinary_id) {
          await cloudinary.uploader.destroy(user.cloudinary_id);
        }
        // upload new image to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "uploads",
          width: 500,
          height: 500,
          crop: "limit",
          quality: "auto",
        });

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
           return res.status(StatusCode.BAD_REQUEST).json({
             success: false,
             message: "email already exist",
           });
         }
         // updated email
         user.email = req.body.email;
       };

       // password hashing with bcrypt
        if (req.body.password) {
          //password length must be 6 charcters
          if (req.body.password.length < 6) {
            return res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: "Password must be at least 6 characters",
            });
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

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Profile updated successfully",
          data: updatedUser,
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