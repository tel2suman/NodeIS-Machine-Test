const express = require("express");

const authchek = require("../middleware/auth");

const UserController = require("../controllers/UserController");

const router = express.Router();

router.post("/create/user", UserController.CreateUser);

router.post("/login/user", UserController.loginUser);

router.use(authchek);

// Create record (user, manager, admin)
router.post("/create-data", UserController.createData);

//view Record
router.get("/all-data", UserController.viewData);

// Update record (manager, admin only)
router.put("/update-data/:id", UserController.updateData);

// Delete Record
router.delete("/delete-data/:id", UserController.deleteData);

module.exports = router;