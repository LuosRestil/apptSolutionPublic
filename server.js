const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cookieSession = require("cookie-session");
const path = require("path");
const passport = require("./passport");
const routes = require("./routes/routes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});
mongoose.connection.on("connected", () => {
  console.log("Database connection successful!");
});

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", routes);

if (process.env.NODE_ENV == "production") {
  console.log("process.env.NODE_ENV == production");
  app.use(express.static("client/build"));
  app.get("*", function(req, res) {
    console.log("hitting * route");
    res.sendFile(path.join(__dirname, "/client/build/index.html"), function(
      err
    ) {
      if (err) {
        res.status(500).send(err);
      }
    });
  });
}

app.listen(PORT, console.log(`Express server listening on port ${PORT}`));
