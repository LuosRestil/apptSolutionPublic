const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const cookieSession = require("cookie-session");
const path = require("path");
const passport = require("./passport");
const routes = require("./routes/routes");
const Appt = require("./models/appt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
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
    keys: ["key1", "key2"],
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", routes);

if (process.env.NODE_ENV == "production") {
  console.log("process.env.NODE_ENV == production");
  app.use(express.static("client/build"));
  app.get("*", function (req, res) {
    console.log("hitting * route");
    res.sendFile(path.join(__dirname, "/client/build/index.html"), function (
      err
    ) {
      if (err) {
        res.status(500).send(err);
      }
    });
  });
}

const months = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

// ************************************************************
// COMMENTED OUT BECAUSE HEROKU APP SLEEPS AND HAS USAGE LIMITS
// ************************************************************
// cron.schedule(
//   // cron timezone does not account for daylight time
//   "0 18 * * *",
//   () => {
//     console.log("cron activated");
//     Appt.find({
//       $and: [
//         { date: { $gt: new Date().getTime() + 43200000 } },
//         { date: { $lt: new Date().getTime() + 129600000 } },
//       ],
//     })
//       .populate("customers.customer")
//       .exec((err, docs) => {
//         if (err) {
//           console.log(err);
//         } else {
//           docs.forEach((appt) => {
//             let mailList = appt.customers.map(
//               (customer) => customer.customer.email
//             );
//             if (mailList.length > 0) {
//               console.log(mailList);
//               let month = months[appt.month];
//               let day = appt.day;
//               let hr = appt.hr;
//               let min = appt.min;
//               let ampm = "AM";
//               if (hr > 11) {
//                 ampm = "PM";
//               }
//               if (hr > 12) {
//                 hr -= 12;
//               }
//               if (min == 0) {
//                 min = "00";
//               }
//               let mailOptions = {
//                 to: mailList,
//                 from: "McCoy's By Appointment",
//                 subject: "Appointment Reminder",
//                 text: `This is a reminder from McCoy's of your appointment tomorrow, ${month} ${
//                   day + 1
//                 } at ${hr}:${min} ${ampm}. Be there or be square!\n\n~McCoy's`,
//               };
//               transporter.sendMail(mailOptions, (err, info) => {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   console.log("Email sent: " + info.response);
//                 }
//               });
//             }
//           });
//         }
//       });
//   },
//   { timezone: "America/Chicago" }
// );

app.listen(PORT, console.log(`Express server listening on port ${PORT}`));
