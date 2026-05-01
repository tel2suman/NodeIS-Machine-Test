const Task = require("../models/Task");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const StatusCode = require("../utils/StatusCode");

class TaskController {
  async createTask(req, res) {
    try {
      const { title, description, assignedBy, assignedTo, priority, status } =
        req.body;

      if (!title || !description || !assignedBy || !assignedTo) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "all fields are required",
        });
      }

      const existTask = await Task.findOne({ title });

      if (existTask) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Task already exist",
        });
      }

      const data = new Task({
        title,
        description,
        assignedBy,
        assignedTo,
        priority,
        status,
      });

      const task = await data.save();

      // Your record creation logic here
      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Task created successfully.",
        data: task,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // view task
  async viewTask(req, res) {
    try {
      const data = await Task.find();

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "all Tasks are here",
        total: data.length,
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  // single product
  async viewSingleTask(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, product id required!",
        });
      }

      const data = await Task.findById(id);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "selected product is here",
        data: data,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateTask(req, res) {
    try {
      const { taskId } = req.params;

      const { title, description, status } = req.body;

      if (!taskId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, task id required!",
        });
      }

      // ✅ Only update task that belongs to logged-in user
        const task = await Task.findByIdAndUpdate({_id: taskId,
          userId: req.user.userId, // 🔐 ownership check
        },
        {title, description, status},
        { new: true },
      );

      if (!task) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Task not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteTask(req, res) {
    try {
      const { taskId } = req.params;

      if (!taskId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "oops, task id required!",
        });
      }

      const category = await Task.findByIdAndDelete(taskId);

      return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "task deleted",
      });
    } catch (error) {
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new TaskController();