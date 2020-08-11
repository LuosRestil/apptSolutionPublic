const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  // role will either be user or admin
  // *********************************************************************************
  // *********************************************************************************
  // TODO change role to boolean, i.e. admin: true/false
  // *********************************************************************************
  // *********************************************************************************
  role: { type: String, required: true, default: "user" },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
