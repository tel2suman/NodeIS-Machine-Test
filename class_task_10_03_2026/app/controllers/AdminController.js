
const Admin = require("../models/admin");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const StatusCode = require("../utils/StatusCode");

const genPass = require("../utils/genPass");

class AdminController {
  async UserCheckAuth(req, res, next) {
    try {

      if (req.user) {

        next();

      } else {

        res.redirect("/login/view");
      }
    } catch (error) {

      req.flash("error", error.message);
    }
  }

  //register view
  signupPage(req, res) {
    res.render("signup", {
      title: "Signup Page",
    });
  }

  // Login page
  async loginPage(req, res) {
    res.render("login", {
      title: "Login Page",
    });
  }

  // Password view page
  async passChange(req, res) {
    res.render("password_change", {
      title: "Password Change Page",
    });
  }

  // New Login page
  async newLogin(req, res) {
    res.render("new_login", {
      title: "Login Page",
    });
  }

  async Signup(req, res) {
    try {
      const { name, email, phone, role } = req.body;

      if (!name || !email || !phone || !role) {
        req.flash("error", "All fields are required");

        return res.redirect("/signup/view");
      }

      const existUser = await Admin.findOne({ email });

      if (existUser) {
        return res.render("signup", {
          title: "Signup Page",
          message: "User already exists",
        });
      }

      // Generate password
      const password = genPass;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userdata = await Admin.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
      });

      // Send email with credentials
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Your Login Credentials",
        html: `
          <h3>Welcome to Employee Management System</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please change your password after login.</p>
        `,
      });

      return res.redirect("/login/view");
    } catch (error) {
      req.flash("error", error.message);

      return res.redirect("/signup/view");
    }
  }

  //login User
  async empLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash("error", "Email & Passwords are required");

        return res.redirect("/login/view");
      }

      const user = await Admin.findOne({ email });

      if (!user) {
        req.flash("error", "Invalid Credentials");

        return res.redirect("/login/view");
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        req.flash("error", "Password does not match");

        return res.redirect("/login/view");
      }

      const token = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" },
      );

      req.flash("success", "Welcome To Dashbaord Successfully");

      if (token) {
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
      }

      // 🔐 First login case
      if (user.firstLogin) {

        req.flash("success", "Login Successfull & Password change required");

        return res.redirect("/change-pass/view");
      }

      req.flash("success", "Welcome To Dashboard Successfully");

      return res.redirect("/dashboard");

    } catch (error) {

      req.flash("error", error.message);

      return res.redirect("/login/view");
    }
  }

  async EmpChangePassword(req, res) {
    try {
      const { password } = req.body;

      if (!password || password.length < 8) {
        req.flash("error", "Invalid Credentials");

        return res.redirect("/change-pass/view");
      }

      // 🔐 Get userId from token (NOT from body)
      const userId = req.user.userId;

      const user = await Admin.findById(userId);

      if (!user) {
        req.flash("error", "User not found");

        return res.redirect("/change-pass/view");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;

      user.firstLogin = false; //Disable first login flag

      await user.save();

      res.clearCookie("token");

      req.flash(
        "success",
        "Password updated successfully. Please login again.",
      );

      return res.redirect("/login/view");
    } catch (error) {
      console.error("Change Password Error:", error);

      req.flash("error", error.message);

      return res.redirect("/change-pass/view");
    }
  }

  // dashboard page
  async dashboard(req, res) {

    try {

      const data = await Admin.findById(req.user.userId);

      if (!data) {
        return res.render("dashboard", {
          title: "Employee Dashboard Not Found",
          data: null,
        });
      }

      res.render("dashboard", {
        title: "Employee Dashboard Page",
        data: data,
      });

    } catch (error) {

      req.flash("error", "Error loading dashboard");

      res.status(500).send("Error loading dashboard");
    }
  }

  // logout user
  async logoutUser(req, res) {
    try {
      // clear cookie
      res.clearCookie("token");

      return res.redirect("/login/view");
    } catch (error) {
      req.flash("error", error.message);
    }
  }
}


module.exports = new AdminController();
