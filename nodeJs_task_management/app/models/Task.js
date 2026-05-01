const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TaskSchema = new Schema(

  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed"],
      default: "Pending",
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const TaskModel = mongoose.model("Task", TaskSchema);

module.exports = TaskModel;
