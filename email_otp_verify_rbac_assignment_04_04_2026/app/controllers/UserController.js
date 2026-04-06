
const User = require("../models/user");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

const SendEmail = require("../utils/SendEmail");

const OTPModel = require("../models/otpModel");

class UserController {
  async registerUser(req, res) {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !phone || !password) {
        return res.status(400).json({
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

      const salt = await bcrypt.genSalt(10);

      const hasgpassword = await bcrypt.hash(password, salt);

      const userdata = new User({
        name,
        email,
        phone,
        password: hasgpassword,
      });

      const data = await userdata.save();

      await SendEmail(req, data);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "user registered successfully & please verify your email",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  async verifyUser(req, res) {
    try {
      const { email, otp } = req.body;
      // Check if all required fields are provided
      if (!email || !otp) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ status: false, message: "All fields are required" });
      }
      const existingUser = await User.findOne({ email });

      // Check if email doesn't exists
      if (!existingUser) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json({ status: "failed", message: "Email doesn't exists" });
      }

      // Check if email is already verified
      if (existingUser.is_verified) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ status: false, message: "Email is already verified" });
      }
      // Check if there is a matching email verification OTP
      const emailVerification = await OTPModel.findOne({
        userId: existingUser._id,
        otp,
      });
      if (!emailVerification) {
        if (!existingUser.is_verified) {
          // console.log(existingUser);
          await SendEmail(req, existingUser);
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Invalid OTP, new OTP sent to your email",
          });
        }
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ status: false, message: "Invalid OTP" });
      }
      // Check if OTP is expired
      const currentTime = new Date();
      // 15 * 60 * 1000 calculates the expiration period in milliseconds(15 minutes).
      const expirationTime = new Date(
        emailVerification.createdAt.getTime() + 5 * 60 * 1000,
      );
      if (currentTime > expirationTime) {
        // OTP expired, send new OTP
        await SendEmail(req, existingUser);
        return res.status(StatusCode.BAD_REQUEST).json({
          status: "failed",
          message: "OTP expired, new OTP sent to your email",
        });
      }
      // OTP is valid and not expired, mark email as verified
      existingUser.is_verified = true;

      await existingUser.save();

      // Delete email verification document
      await OTPModel.deleteMany({ userId: existingUser._id });
      return res
        .status(StatusCode.SUCCESS)
        .json({ status: true, message: "Email verified successfully" });
    } catch (error) {
      console.error(error);
      res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: "Unable to verify email, please try again later",
      });
    }
  }

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
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "password does not match",
        });
      }

      if (!user.is_verified) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ status: false, message: "Your account is not verified" });
      }

      if (user && user.is_admin == "user") {
        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" },
        );

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "user login successfull!!",
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
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

  async userDashboard(req, res) {
    try {
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "welcome to user dashbaord",
            data: req.user,
        });
    } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: error.message,
        });
    }
  }
}





module.exports = new UserController();