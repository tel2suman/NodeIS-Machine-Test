const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

class UserController {

    async createUser(req, res) {

        try {

            const { name, email, password, role } = req.body;

            if (!name || !email || !password) {
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

            const salt = await bcrypt.genSalt(10);

            const hashedpassword = await bcrypt.hash(password, salt);

            const userdata = new User({
              name,
              email,
              password: hashedpassword,
              role,
            });

            const data = await userdata.save();

            return res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "user registered successfull!!",
              data: data,
            });

        } catch (error) {
            return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: error.message,
            });
        }
    }

    async loginUser(req, res) {

        try {

          const { email, password } = req.body;

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

          const accessToken = jwt.sign(
            {
              userId: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "15m" },
          );

          const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" },
          );

          user.refreshToken = refreshToken;

          await user.save();

          //Cookies
            res.cookie("userAccessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            });

            res.cookie("userRefreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            });

            return res.status(StatusCode.SUCCESS).json({
              success: true,
              message: "user login successfull!!",
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              },
              accesstoken: accessToken,
              refreshtoken: refreshToken,
            });

        } catch (error) {

            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    }

    async logoutUser(req, res) {

      try {

        const refreshToken = req.cookies.userRefreshToken;

          if (refreshToken) {

            const user = await User.findOne({ refreshToken });

            if (user) {
              user.refreshToken = null;
              await user.save();
            }
          }

          res.clearCookie("userAccessToken");

          res.clearCookie("userRefreshToken");

          return res.status(StatusCode.SUCCESS).json({
            success: true,
            message: "user logged out successfully!!",
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