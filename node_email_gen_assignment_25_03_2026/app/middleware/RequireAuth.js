
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");

const requireAuth = async (req, res, next) => {

  const accessToken = req.cookies?.accessToken;

  const refreshToken = req.cookies?.refreshToken;

  // 🚫 No tokens
  if (!accessToken && !refreshToken) {

    return next();
  }

  try {

    // ✅ Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    return next();

  } catch (accessError) {

    // 🔁 Try refresh token
    if (!refreshToken) {
      return res.redirect("/login/view");
    }

    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      );

      const user = await Admin.findById(decodedRefresh.userId);

      if (!user || user.refreshToken !== refreshToken) {
        return res.redirect("/login/view");
      }

      // 🔁 Generate new access token
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

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      req.user = {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      return next();

    } catch (refreshError) {

      return res.redirect("/login/view");
    }
  }
};

module.exports = requireAuth;
