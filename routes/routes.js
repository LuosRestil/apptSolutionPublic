const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const passport = require("../passport");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Appt = require("../models/appt");
const ResetToken = require("../models/resetToken");

// const mongoose = require("mongoose");
require("dotenv").config();

const customerLimit = 9;

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.send({ error: "Unauthorized" });
};

router.post("/register", (req, res) => {
  if (req.body.password !== req.body.confirmPassword) {
    return res.send({
      error: "Password confirmation does not match password.",
    });
  }
  let phoneDigits;
  if (req.body.phone) {
    phoneDigits = req.body.phone.replace(/\D/g, "");
  }
  if (phoneDigits) {
    if (phoneDigits.length !== 10) {
      return res.send({ error: "Phone number must be 10 digits long." });
    }
  }
  User.findOne(
    { $or: [{ email: req.body.email, phone: req.body.phone }] },
    (err, docs) => {
      if (err) {
        return res.send(err);
      } else if (docs) {
        if (docs.phone === phoneDigits) {
          return res.send({ error: "That phone number is already in use." });
        } else if (docs.email === req.body.email)
          return res.send({ error: "That email is already in use." });
      } else {
        const pw_hash = bcrypt.hashSync(req.body.password, 10);
        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          phone: phoneDigits,
          password: pw_hash,
        });
        newUser.save((err, user) => {
          if (err) {
            console.log(err);
            return res.send(err);
          } else {
            return res.send({ msg: "Registration successful!" });
          }
        });
      }
    }
  );
});

router.post("/login", (req, res, next) => {
  // Custom passport callback, (as normal way is structured on server routing)
  passport.authenticate("local-signin", (err, user) => {
    if (err) {
      return res.status(500).json({
        error: err,
      });
    }
    // start session, serialize user with passport serialize
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.json({ user: user._id });
    });
  })(req, res, next);
  // not sure where this closing (req, res, next) is going...
});

router.get("/logout", ensureAuth, (req, res) => {
  // Logs out user, returns msg on success
  req.logout();
  return res.send({ msg: "Logged out" });
});

router.post("/getAppts", ensureAuth, (req, res) => {
  let userDate = new Date(req.body.datetime);
  // get all appts if admin, all future appts if user. returns array of appt objects on success.
  if (req.user.role === "user") {
    Appt.find(
      {
        date: { $gte: userDate },
      },
      {},
      { lean: true },
      (err, docs) => {
        if (err) {
          console.log(err);
          return res.send(err);
        } else {
          return res.send(docs);
        }
      }
    );
  } else {
    Appt.find({}, {}, { lean: true }, (err, docs) => {
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        return res.send(docs);
      }
    });
  }
});

router.post("/makeAppt", ensureAuth, (req, res) => {
  // make sure this is only appt of the day
  // make sure slot hasn't filled since user opened the page
  // add user to appt.customers or deny appt
  // if appt.customers.length will == customerLimit, also appt.customers.full = true
  // return msg on success
  Appt.find(
    {
      store: req.body.store,
      month: req.body.month,
      day: req.body.day,
      "customers.customer": req.user._id,
    },
    (err, docs) => {
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        if (docs.length > 0) {
          return res.send({
            error:
              "You already have an appointment on this day. Please select another.",
          });
        } else {
          Appt.findOne(
            {
              store: req.body.store,
              month: req.body.month,
              day: req.body.day,
              hr: req.body.hr,
              min: req.body.min,
            },
            (err, appt) => {
              if (err) {
                return res.send(err);
              } else {
                if (appt.full) {
                  return res.send({
                    error:
                      "Uh-oh! It looks like that appointment slot was filled while you were making your selection. Please try another.",
                  });
                } else {
                  appt.customers.push({
                    customer: req.user._id,
                    checkedIn: false,
                  });
                  if (appt.customers.length === customerLimit) {
                    appt.full = true;
                  }
                  appt.save();
                  let month = months[req.body.month];
                  let hr = req.body.hr;
                  let min = req.body.min;
                  let ampm = "AM";
                  if (req.body.hr > 11) {
                    ampm = "PM";
                  }
                  if (req.body.hr > 12) {
                    hr = req.body.hr - 12;
                  }
                  if (min == 0) {
                    min = "00";
                  }
                  return res.send({
                    msg: `Your appointment for ${month} ${req.body.day} at ${hr}:${min} ${ampm} has been set!`,
                  });
                }
              }
            }
          );
        }
      }
    }
  );
});

router.get("/getUser/", ensureAuth, (req, res) => {
  req.user.password = "[redacted]";
  return res.send(req.user);
});

router.get("/getUserAppts", ensureAuth, (req, res) => {
  // get all of a user's appointments for display
  // return array of appts on success
  Appt.find({ "customers.customer": req.user._id }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.send(err);
    } else {
      return res.send(docs);
    }
  });
});

router.delete("/userCancelAppt/:id", ensureAuth, (req, res) => {
  console.log("cancel route reached");
  // remove user from appt customers by appt id
  // return msg on success
  let month;
  let day;
  let hr;
  let min;
  let ampm;
  Appt.findOneAndUpdate({});
  Appt.findOne(
    { _id: req.params.id, "customers.customer": req.user._id },
    (err, docs) => {
      if (err) {
        return res.send(err);
      }
      if (docs) {
        month = docs.month;
        day = docs.day;
        if (docs.hr > 12) {
          hr = docs.hr - 12;
        } else {
          hr = docs.hr;
        }
        if (docs.min == 0) {
          min = "00";
        } else {
          min = docs.min;
        }
        if (docs.hr < 12) {
          ampm = "AM";
        } else {
          ampm = "PM";
        }
        Appt.updateOne(
          { _id: req.params.id },
          {
            $pull: { customers: { customer: req.user._id } },
            $push: { cancellations: req.user._id },
            full: false,
          },
          (err, docs) => {
            if (err) {
              return res.send(err);
            } else {
              return res.send({
                msg: `Your appointment for ${months[month]} ${day} at ${hr}:${min} ${ampm} has been successfully canceled.`,
              });
            }
          }
        );
      } else {
        return res.send({
          error:
            "Oops! It looks like that appointment has already been canceled.",
        });
      }
    }
  );
});

router.post("/getCustomerData", ensureAuth, (req, res) => {
  if (req.user.role === "admin") {
    Appt.findOne({
      store: req.body.store,
      month: req.body.month,
      day: req.body.day,
      hr: req.body.hr,
      min: req.body.min,
    })
      .populate("customers.customer")
      .exec((err, data) => {
        if (err) {
          console.log(err);
          return res.send(err);
        } else {
          data.customers.forEach((customer) => {
            if (customer.customer) {
              customer.customer.password = "[redacted]";
            }
          });
          return res.send(data);
        }
      });
  } else {
    return res.status(401);
  }
});

router.post("/toggleCheckin", ensureAuth, (req, res) => {
  if (req.user.role === "admin") {
    Appt.findOneAndUpdate(
      { "customers._id": req.body.customer._id },
      { $set: { "customers.$.checkedIn": req.body.checkIn } },
      { new: true }
    )
      .populate("customers.customer")
      .exec((err, data) => {
        if (err) {
          console.log(err);
          return res.send(err);
        } else {
          data.customers.forEach((customer) => {
            if (customer) {
              customer.customer.password = "[redacted";
            }
          });
          return res.send(data);
        }
      });
  } else {
    return res.status(401);
  }
});

router.post("/adminCancelAppt", ensureAuth, (req, res) => {
  if (req.user.role === "admin") {
    Appt.findOneAndUpdate(
      {
        "customers._id": req.body.customer._id,
      },
      {
        $pull: { customers: { _id: req.body.customer._id } },
        $push: { cancellations: req.body.customer.customer._id },
      },
      { new: true }
    )
      .populate("customers.customer")
      .exec((err, data) => {
        if (err) {
          return res.send(err);
        } else {
          data.customers.forEach((customer) => {
            customer.customer.password = "[redacted]";
          });
          return res.send(data);
        }
      });
  } else {
    return res.status(401);
  }
});

router.post("/resetRequest", (req, res) => {
  // generate token, add resetToken to db, send email to user
  if (req.body.email) {
    User.findOne({ email: req.body.email }, (err, docs) => {
      if (err) {
        return res.send(err);
      } else {
        if (docs) {
          // generate token, add resetToken to db, send email to user
          let resetToken = new ResetToken({
            userId: docs._id,
            resetToken: crypto.randomBytes(16).toString("hex"),
          });
          resetToken.save((err) => {
            if (err) {
              return res.send(err);
            }
            ResetToken.deleteOne({
              userId: docs._id,
              resetToken: { $ne: resetToken.resetToken },
            }).exec();
          });
          let mailOptions = {
            to: docs.email,
            from: process.env.EMAIL,
            subject: "Password Reset Request",
            text:
              "You are receiving this email from McCoy's By Appointment because you have requested a password reset.\n\n" +
              "Please click on the following link, or copy it and paste it into your browser, to complete the process:\n\n" +
              `${req.protocol}` +
              "://" +
              req.get("Host") +
              "/emailResetPass/" +
              resetToken.resetToken +
              "\n\n" +
              "If you did not request this, please ignore this email and your password will remain unchanged.\n",
          };
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.log(err);
              return res.send(err);
            } else {
              console.log("Email sent: " + info.response);
              return res.send({
                msg: `Success.`,
              });
            }
          });
        } else {
          return res.send({ error: "Invalid email address." });
        }
      }
    });
  } else {
    return res.send({ error: "Email is required." });
  }
});

router.post("/updateUserInfo", ensureAuth, (req, res) => {
  if (req.user.role === "user") {
    let password = req.body.password;
    if (!bcrypt.compareSync(password, req.user.password)) {
      return res.send({
        error: "Current password incorrect. Please try again.",
      });
    }

    if (req.body.option === "email") {
      // perform checks, update email
      if (req.body.email !== req.body.confirmEmail) {
        return res.send({
          error: "New email confirmation does not match new email.",
        });
      }
      User.findOne({ email: req.body.email }, (err, docs) => {
        if (err) {
          return res.send(err);
        } else if (docs) {
          return res.send({ error: "That email is already in use." });
        } else {
          User.findOneAndUpdate(
            { _id: req.user._id },
            { email: req.body.email },
            (err, docs) => {
              if (err) {
                return res.send(err);
              } else {
                return res.send({ msg: "Email successfully updated." });
              }
            }
          );
        }
      });
    } else if (req.body.option === "phone") {
      // perform checks, update phone
      if (req.body.phone !== req.body.confirmPhone) {
        return res.send({
          error:
            "New phone number confirmation does not match new phone number.",
        });
      }
      let phoneDigits = req.body.phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        return res.send({
          error: "Phone number must be 10 digits long.",
        });
      }
      User.findOne({ phone: phoneDigits }, (err, docs) => {
        if (err) {
          return res.send(err);
        } else if (docs) {
          return res.send({ error: "That phone number is already in use." });
        } else {
          User.findOneAndUpdate(
            { _id: req.user._id },
            { phone: phoneDigits },
            (err, docs) => {
              if (err) {
                return res.send(err);
              } else {
                return res.send({ msg: "Phone number updated successfully." });
              }
            }
          );
        }
      });
    } else if (req.body.option === "newPassword") {
      // perform checks, update password
      if (req.body.newPassword !== req.body.confirmNewPassword) {
        return res.send({
          error: "New password confirmation does not match new password.",
        });
      }
      const pw_hash = bcrypt.hashSync(req.body.newPassword, 10);
      User.findOneAndUpdate(
        { _id: req.user._id },
        { password: pw_hash },
        (err, docs) => {
          if (err) {
            return res.send(err);
          } else {
            return res.send({ msg: "Password successfully updated." });
          }
        }
      );
    }
  } else {
    return res.send({ error: "You are not authorized to change Admin info." });
  }
});

router.post("/emailResetPass", (req, res) => {
  // check token, reset user pass
  if (req.body.password !== req.body.confirmPassword) {
    return res.send({
      error: "Password confirmation does not match password.",
    });
  }
  if (req.body.token) {
    ResetToken.findOne({ resetToken: req.body.token }, (err, docs) => {
      if (err) {
        return res.send(err);
      } else {
        if (docs) {
          const pw_hash = bcrypt.hashSync(req.body.password, 10);
          User.findOneAndUpdate(
            { _id: docs.userId },
            { password: pw_hash },
            (err, docs) => {
              if (err) {
                return res.send(err);
              } else {
                console.log(docs);
                return res.send({
                  msg:
                    "Your password has been successfully reset. You may now log in.",
                });
              }
            }
          );
        } else {
          return res.send({ error: "Unauthorized or expired URL." });
        }
      }
    });
  } else {
    return res.status(500).send({ error: "Unauthorized URL." });
  }
});

module.exports = router;
