const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("something is wrong with your email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.includes("password")) {
        throw new Error(`Password cannot be password`);
      }
    },
  },
  age: {
    type: Number,
    required: true,
    default: 21,
    validate(value) {
      if (value < 0) {
        throw new Error("Age cannot be below zero");
      }
    },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
