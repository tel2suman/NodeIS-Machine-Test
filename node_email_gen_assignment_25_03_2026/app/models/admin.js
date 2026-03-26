
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter valid email"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    isActive: {
      type: String,
      enum: ["active", "deactivated"],
      default: "active",
    },

    firstLogin: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
    },

    lastLogin: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const AdminModel = mongoose.model("admin", AdminSchema);

module.exports = AdminModel;
