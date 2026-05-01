
const express = require("express");

const TaskController = require("../controllers/TaskController");

const tokenCheck = require("../middleware/tokenCheck");

const Rolechek = require("../middleware/roleCheck");

const router = express.Router();

router.use(tokenCheck);

router.post("/create-task",
    Rolechek("Admin", "SuperAdmin", "Manager"),
    TaskController.createTask
);

router.get(
  "/view-all-task",
  Rolechek("Admin", "SuperAdmin"),
  TaskController.viewTask,
);

router.get(
  "/view-single-task/:id",
  Rolechek("Admin", "SuperAdmin"),
  TaskController.viewSingleTask,
);

router.put(
  "/update-task/:taskId",
  Rolechek("Manager", "Employee"),
  TaskController.updateTask,
);

router.delete(
  "/delete-task/:taskId",
  Rolechek("Manager", "Admin", "SuperAdmin"),
  TaskController.deleteTask,
);


module.exports = router;