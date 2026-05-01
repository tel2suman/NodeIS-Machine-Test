const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter valid email"],
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "Manager", "Employee"],
      default: "Employee",
    },

    status: {
      type: String,
      enum: ["Activate", "Deactivate"],
      default: "Activate",
    },

    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
