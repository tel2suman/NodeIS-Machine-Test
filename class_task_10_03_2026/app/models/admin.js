
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
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    firstLogin: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// // Hash the password before saving
// AdminSchema.pre("save", async function (next) {

//   try {

//     const salt = await bcrypt.genSalt(10);

//     const hashedPassword = await bcrypt.hash(this.password, salt);

//     this.password = hashedPassword;

//     next();

//   } catch (error) {

//     next(error);
//   }
// });

const AdminModel = mongoose.model("admin", AdminSchema);

module.exports = AdminModel;
