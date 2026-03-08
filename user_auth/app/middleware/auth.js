
const jwt = require("jsonwebtoken");

const authCheck=async(req, res, next)=>{

     const token =
       req.body?.token ||
       req.query?.token ||
       req.headers["x-access-token"] ||
       req.headers["authorization"] ||
       req.cookies?.token;

    if (!token) {

        return res.redirect("/login");
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decoded;

        next();

    } catch (error) {

        return res.redirect("/login");
    }
}

module.exports = authCheck