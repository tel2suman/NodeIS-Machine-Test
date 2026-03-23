
const StatusCode = require("../utils/StatusCode");

const authorizeRole = (req, res, next)=>{

    if (req.user.role !== role) {
      return res.status(StatusCode.FORBIDDEN).json({
        success: false,
        message: "Access denied",
      });
    }
  next();
}

module.exports = authorizeRole;