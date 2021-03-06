const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user");
const bcrypt = require("bcrypt");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});
mongoose.connection.on("connected", () => {
  console.log("Database connection successful!");
});

let firstName = process.argv[2];
let lastName = process.argv[3];
let email = process.argv[4];
let password = process.argv[5];
let role = process.argv[6];
let pw_hash = bcrypt.hashSync(password, 10);

const newUser = new User({
  firstName: firstName,
  lastName: lastName,
  email: email,
  password: pw_hash,
  role: role
});

newUser.save((err, user) => {
  if (err) {
    console.log(err);
    mongoose.connection.close();
  } else {
    console.log(user);
    mongoose.connection.close();
  }
});
