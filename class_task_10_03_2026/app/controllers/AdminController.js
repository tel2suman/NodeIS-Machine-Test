const Admin = require("../models/admin");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");


class AdminController {
  async AdminCheckAuth(req, res, next) {
    try {
      if (req.user) {

        next();

      } else {

        res.redirect("/admin/login");
      }
    } catch (error) {

      req.flash("error", error.message);
    }
  }

  adminLoginPage(req, res) {
    res.render("admin/admin_login", {
      title: "Admin Login Page",
    });
  }

  // admin login
  async adminLogin(req, res) {
    try {
      console.log("BODY:", req.body);

      // Get user input
      const { email, password } = req.body;

      // Validate user input
      if (!email || !password) {
        console.log("All input is required");

        return res.redirect("/admin/login");
      }

      // Validate if user exist in our database
      const user = await Admin.findOne({ email });

      if (
        user &&
        user.role === "admin" &&
        (await bcrypt.compare(password, user.password))
      ) {
        // Create token
        const accessToken = jwt.sign(
          {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "15m",
          },
        );

        const refreshToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: "7d" },
        );

        if (accessToken && refreshToken) {
          res.cookie("accessToken", accessToken, {
            sameSite: "strict",
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
          });

          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          return res.redirect("/admin/dashboard");
        } else {
          req.flash("error", "Login failed");

          return res.redirect("/admin/login");
        }
      }

      req.flash("error", "Invalid email or password");

      return res.redirect("/admin/login");
    } catch (error) {
      req.flash("error", "Something went wrong");

      return res.redirect("/admin/login");
    }
  }

  // dashboard page
  async adminDashboard(req, res) {

    try {

      const data = await Admin.find();

      res.render("admin/admin_dashboard", {
        title: "Admin Dashboard Page",
        data: data,
      });

    } catch (error) {
      req.flash("error", "Error loading dashboard");

      res.status(500).send("Error loading dashboard");
    }
  }

  //edit record
  async editAdminData(req, res) {

    try {

      const id = req.params.id;

      const edit = await Admin.findById(id);

      res.render("edit_data", {
        title: "Edit Data Page",
        data: edit,
      });

    } catch (error) {

      req.flash(error, "Error in edit data");
    }
  }

  //update admin
  async updateAdminData(req, res) {

    try {

      const user = await Admin.findById(req.params.id);

      if (!user) {

        return res.redirect("/admin/login");
      }

      // Handle password update
      if (req.body.password && req.body.password.trim() !== "") {
        if (req.body.password.length < 6) {
          return res.redirect("/edit/data");
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      // Remove password from req.body to prevent overwrite
      delete req.body.password;

      // Update other fields
      Object.assign(user, req.body);

      // Save updated user
      await user.save();

      res.redirect("/admin/dashboard");
    } catch (error) {

      req.flash(error, "Error in edit record");
    }
  }

  async updateStatus(req, res) {

    try {

       const id = req.params.id;

       const emp = await Admin.findById(id);

       if (!emp) {

         req.flash("error", "Record not found");

         return res.redirect("/admin/dashboard");
       }

       emp.isActive = emp.isActive === "active" ? "deactivated" : "active";

       await emp.save();

       req.flash("success", "Status updated successfully");

       res.redirect("/admin/dashboard");

    } catch (error) {

      req.flash("error", "Error in updating status");

      res.redirect("/admin/dashboard");
    }
  }

  // logout user
  async adminLogout(req, res) {

    try {

      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {

        const user = await Admin.findOne({ refreshToken });

        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      }

      // clear cookie
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.redirect("/admin/login");

    } catch (error) {

      req.flash("error", error.message);
    }
  }
}



module.exports = new AdminController();