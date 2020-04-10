const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ApptSchema = new Schema({
  store: { type: String, required: true },
  dotw: { type: String, required: true },
  month: { type: Number, required: true },
  day: { type: Number, required: true },
  hr: { type: Number, required: true },
  min: { type: Number, required: true },
  date: { type: Date, required: true },
  customers: [
    {
      customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      checkedIn: { type: Boolean }
    }
  ],
  cancellations: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  full: { type: Boolean, required: true, default: false }
});

const Appt = mongoose.model("Appt", ApptSchema);

module.exports = Appt;
