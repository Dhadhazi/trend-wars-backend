const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  permission: { type: String, default: "User" },
  created_at: { type: Date, default: Date.now },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
