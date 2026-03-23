
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET_KEY;

const AdminAuthCheck = (req, res, next) => {

  try {

    const token = req.cookies?.token;

    if (!token) {

      req.flash("error", "Access denied. No token provided");

      return res.redirect("/login/view");
    }

     const decoded = jwt.verify(token, SECRET);

    req.user = decoded; // attach decoded data

    next();

  } catch (error) {

    req.flash("error", error.message);

    return res.redirect("/login/view");
  }
};

module.exports = AdminAuthCheck;