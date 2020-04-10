const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const LoginStrategy = new LocalStrategy(
  { usernameField: "email" },
  (email, password, done) => {
    User.findOne({ email: email }, function(err, user) {
      if (err) {
        return done(err, null);
      } else if (!user) {
        return done("Invalid email or password.", null);
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done("Invalid email or password.", null);
      }
      return done(null, user);
    });
  }
);

module.exports = LoginStrategy;
