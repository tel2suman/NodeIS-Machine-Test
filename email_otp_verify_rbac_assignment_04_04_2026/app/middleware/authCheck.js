
const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

const authCheck = async (req, res, next) => {
  const token =
    req.body?.token ||
    req.query?.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(StatusCode.BAD_REQUEST).json({
      status: false,
      message: "Token is required for access this page",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    console.log("afterlogin user", req.user);
  } catch (error) {
    return res.status(StatusCode.BAD_REQUEST).json({
      status: false,
      message: "invalid token",
    });
  }

  return next();
};

module.exports = authCheck;
