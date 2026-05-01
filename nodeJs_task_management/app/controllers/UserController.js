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

    async getRefreshToken(req, res) {

      try {

        const refreshToken = req.cookies.userRefreshToken;

        if (!refreshToken) {
          return res
            .status(StatusCode.BAD_REQUEST)
            .json({ success: false, message: "No refresh token" });
        }

        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET,
        );

        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
          return res
            .status(StatusCode.BAD_REQUEST)
            .json({ success: false, message: "Invalid token" });
        }

        const newAccessToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15m" },
        );

        res.cookie("userAccessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });

        res.json({ success: false, message: "Token refreshed" });

      } catch (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid refresh token"
        });
      }
    }

    async updateUserStatus(req, res) {
      
      try {

        const { userId } = req.params;

        const { status, role } = req.body;

        if (!["Activate", "Deactivate"].includes(status)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Invalid status"
          });
        }

        if (!["SuperAdmin", "Admin", "Manager", "Employee"].includes(role)) {
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Invalid role",
          });
        }

        const user = await User.findByIdAndUpdate(req.user.userId,
          { status, role },{ new: true },
        );

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          message: "Status & role updated",
          user,
        });

      } catch (error) {
        return res.status(StatusCode.SERVER_ERROR).json({
          success: false,
          message: error.message,
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