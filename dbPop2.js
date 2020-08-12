const mongoose = require("mongoose");
const Appt = require("./models/appt");

require("dotenv").config();

mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Database connection successful!");
});

const monthLengths = {
  0: 31,
  1: 28,
  2: 31,
  3: 30,
  4: 31,
  5: 30,
  6: 31,
  7: 31,
  8: 30,
  9: 31,
  10: 30,
  11: 31,
};

const regularHrs = {
  0: { startHr: 11, endHr: 18 },
  1: { startHr: 9, endHr: 20 },
  2: { startHr: 9, endHr: 20 },
  3: { startHr: 9, endHr: 20 },
  4: { startHr: 9, endHr: 20 },
  5: { startHr: 9, endHr: 21 },
  6: { startHr: 9, endHr: 21 },
};
const summerHrs = {
  0: { startHr: 11, endHr: 18 },
  1: { startHr: 9, endHr: 21 },
  2: { startHr: 9, endHr: 21 },
  3: { startHr: 9, endHr: 21 },
  4: { startHr: 9, endHr: 21 },
  5: { startHr: 9, endHr: 21 },
  6: { startHr: 9, endHr: 21 },
};
// summer hrs last from memorial day to labor day (labor day is normal hours)
// CHANGE THIS EACH YEAR
const summerHrsStart = { month: 4, day: 25 };
const summerHrsEnd = { month: 8, day: 6 };

const apptLength = 30;
const endMin = 60 - apptLength;

const holidays = {
  // 9:00 - 5:30
  newYearsEve: {
    month: 12,
    day: 31,
    startHr: 9,
    endHr: 17,
    endMin: 30 - apptLength,
    closed: false,
  },
  // 12:00 - 9:00, unless sunday, in which case normal hours of 11:00 - 7:00
  newYearsDay: {
    month: 0,
    day: 1,
    startHr: 12,
    endHr: 20,
    endMin: endMin,
    closed: false,
  },
  // 12:00 - 6:00
  easter: {
    month: 3,
    day: 12,
    startHr: 12,
    endHr: 17,
    endMin: endMin,
    closed: false,
  },
  // 12:00 - 6:00
  july4th: {
    month: 6,
    day: 4,
    startHr: 12,
    endHr: 17,
    endMin: endMin,
    closed: false,
  },
  // closed
  // CHANGE THIS EACH YEAR
  thanksgiving: {
    month: 10,
    day: 27,
    startHr: null,
    endHr: null,
    endMin: null,
    closed: true,
  },
  // 9:00 - 5:30
  christmasEve: {
    month: 11,
    day: 24,
    startHr: 9,
    endHr: 17,
    endMin: 30 - apptLength,
    closed: false,
  },
  // closed
  christmasDay: {
    month: 11,
    day: 25,
    startHr: null,
    endHr: null,
    endMin: null,
    closed: true,
  },
};

const dayStrings = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let stores = [
  "Nashville",
  "Knoxville",
  "Chattanooga",
  "Winston-Salem",
  "Greensboro",
];

let appts = [];

let year = 2020;
// Check leap year
if (year % 4 === 0) {
  monthLengths["1"] = 29;
}

// Build appointments for each store
for (let store of stores) {
  // set starting values
  let month = 0;
  let day = 1;
  let hr = 12;
  let min = 0;

  // Set month limit
  while (month < 12) {
    let dayStartHr;
    let dayEndHr;
    let dayEndMin;

    // Create appt date object
    let apptDate = new Date(year, month, day, hr, min);
    let dotw = dayStrings[apptDate.getDay()];

    let isHoliday = false;
    let currentHoliday;
    // Determine holiday status
    for (let holiday in holidays) {
      if (holiday.month === month && holiday.day === day) {
        isHoliday = true;
        currentHoliday = holiday;
      }
    }

    let isSummer =
      month >= summerHrsStart.month &&
      month <= summerHrsEnd.month &&
      day >= summerHrsStart.day &&
      day <= summerHrsEnd.month;

    if (isHoliday) {
      // Set today times by holiday
      if (currentHoliday.closed) {
        // Go to next day
        if (day + 1 <= monthLengths[month]) {
          day++;
        } else {
          month++;
          day = 1;
        }
        hr = 1;
        min = 0;
        continue;
      } else if (currentHoliday === "newYearsDay" && dotw === "Sunday") {
        dayStartHr = regularHrs["0"].startHr;
        dayEndHr = regularHrs["0"].endHr;
        dayEndMin = endMin;
      } else {
        dayStartHr = currentHoliday.startHr;
        dayEndHr = currentHoliday.endHr;
        dayEndMin = currentHoliday.endMin;
      }
    } else if (isSummer) {
      // Set today times by summer hours
      dayStartHr = summerHrs[apptDate.getDay()].startHr;
      dayEndHr = summerHrs[apptDate.getDay()].endHr;
      dayEndMin = endMin;
    } else {
      // Set today times by regular hours
      dayStartHr = regularHrs[apptDate.getDay()].startHr;
      dayEndHr = regularHrs[apptDate.getDay()].endHr;
      dayEndMin = endMin;
    }

    // Now we have our start and end times for the day
    if (hr > dayEndHr || (hr === dayEndHr && min > dayEndMin)) {
      // Invalid appointment, go to next day
      if (day + 1 <= monthLengths[month]) {
        day++;
      } else {
        month++;
        day = 1;
      }
      hr = 1;
      min = 0;
      continue;
    } else if (hr < dayStartHr) {
      hr = dayStartHr;
    }
    // Create appointment and add to list
    let appt = new Appt({
      store: store,
      dotw: dayStrings[dotw],
      month: month,
      day: day,
      hr: hr,
      min: min,
      date: new Date(year, month, day, hr, min),
    });
    appts.push(appt);

    // Go to next slot
    min += apptLength;
    if (min >= 60) {
      min = 0;
      hr++;
    }
  }
}

// Add appointments to database
Appt.collection.insertMany(appts, (err, docs) => {
  if (err) {
    console.log("in error handler of insertMany");
    console.log(err);
  } else {
    console.log("Database populated.");
    mongoose.connection.close();
  }
});
