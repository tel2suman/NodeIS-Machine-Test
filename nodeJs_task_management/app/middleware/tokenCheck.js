
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const StatusCode = require("../utils/StatusCode");

const userAuthCheck = async(req, res, next) => {

    try {
      const accessToken = req.cookies.userAccessToken;

      const refreshToken = req.cookies.userRefreshToken;

      if (!accessToken && !refreshToken) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // ✅ 1. Try Access Token
      if (accessToken) {
        try {
          const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

          req.user = decoded;

          return next();
          
        } catch (err) {
          if (err.name !== "TokenExpiredError") {
            return res.status(StatusCode.BAD_REQUEST).json({
              success: false,
              message: "Invalid token",
            });
          }
        }
      }

      // ❌ No Refresh Token
      if (!refreshToken) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Session expired",
        });
      }

      // ✅ 2. Verify Refresh Token
      let decodedRefresh;

      try {
        decodedRefresh = jwt.verify(
          refreshToken,

          process.env.JWT_REFRESH_SECRET,
        );
      } catch (err) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      const user = await User.findById(decodedRefresh.userId);

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Token mismatch",
        });
      }

      // 🔁 Rotate Refresh Token
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      user.refreshToken = newRefreshToken;

      await user.save();

      // 🔐 New Access Token
      const newAccessToken = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" },
      );

      // 🍪 Cookies
      res.cookie("userAccessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("userRefreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      req.user = {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(StatusCode.SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = userAuthCheck;