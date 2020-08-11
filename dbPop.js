const mongoose = require("mongoose");
const Appt = require("./models/appt");

require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Database connection successful!");
});

const monthLength = { 3: 30, 4: 31, 5: 30, 6: 31 };

const summerStart = { month: 4, day: 25 };

const springHrs = {
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
const holidayHrs = { startHr: 12, endHr: 17 };
const holidays = {
  easter: { month: 3, day: 12 },
  july4th: { month: 6, day: 4 },
};
const apptLength = 30;
const endMin = 60 - apptLength;

const dayStrings = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let appts = [];

let stores = [
  "Nashville",
  "Knoxville",
  "Chattanooga",
  "Winston-Salem",
  "Greensboro",
];

// build appts for each store
// *********************************************************************************
// *********************************************************************************
// TODO add stores collection and make stores a foreign key, or make stores int
// *********************************************************************************
// *********************************************************************************
for (let store of stores) {
  // set starting values
  let year = 2020;
  let month = 3;
  let day = 1;
  let hr = 9;
  let min = 0;
  // set month limit
  while (month < 7) {
    // create appt date object
    let apptDate = new Date(year, month, day, hr, min);
    // create appt
    let appt = new Appt({
      store: store,
      // *********************************************************************************
      // *********************************************************************************
      // TODO change appt model to store dotw as int, and update front end accordingly
      // *********************************************************************************
      // *********************************************************************************
      dotw: dayStrings[apptDate.getDay()],
      month: month,
      day: day,
      hr: hr,
      min: min,
      date: new Date(year, month, day, hr, min),
    });
    // add appt to appts array
    appts.push(appt);

    // determine whether today is a holiday
    let isHoliday = false;
    let holidayList = Object.keys(holidays);
    holidayList.forEach((holiday) => {
      if (
        holidays[holiday].month == apptDate.getMonth() &&
        holidays[holiday].day == apptDate.getDate()
      ) {
        isHoliday = true;
      }
    });

    // if today is a holiday
    if (isHoliday) {
      // holiday hours

      // if last slot of the day
      if (
        apptDate.getHours() == holidayHrs.endHr &&
        apptDate.getMinutes() == endMin
      ) {
        // go to next day

        // if end of the month
        if (apptDate.getDate() == monthLength[apptDate.getMonth()]) {
          // increase month by 1, reset day to 1, reset time according to day and season
          month += 1;
          day = 1;
          if (apptDate.getMonth() < 4 && apptDate.getDate() < 26) {
            hr = springHrs[new Date(year, month, day).getDay()].startHr;
          } else {
            hr = summerHrs[new Date(year, month, day).getDay()].startHr;
          }
          min = 0;
          // if not end of the month
        } else {
          // add one to day of current month and reset time according to day and season
          day += 1;
          if (apptDate.getMonth() < 4 && apptDate.getDate() < 26) {
            hr = springHrs[new Date(year, month, day).getDay()].startHr;
          } else {
            hr = summerHrs[new Date(year, month, day).getDay()].startHr;
          }
          min = 0;
        }
      } else {
        // go to next slot of same day
        if (min != endMin) {
          min += apptLength;
        } else {
          hr += 1;
          min = 0;
        }
      }
      // ***************************************************************************************
      // else if today before summer
    } else if (
      apptDate.getTime() <
      new Date(year, summerStart.month, summerStart.day).getTime()
    ) {
      // spring hrs

      // *TODO* for holiday in holidays, do this check, update preHoliday variable

      // get dotw of day before easter
      let dayBeforeEaster =
        new Date(year, holidays.easter.month, holidays.easter.day).getDay() - 1;
      if (dayBeforeEaster < 0) {
        dayBeforeEaster = 6;
      }

      // if this appt
      if (
        apptDate.getTime() ==
        new Date(
          year,
          holidays.easter.month,
          holidays.easter.day - 1,
          springHrs[dayBeforeEaster].endHr,
          endMin
        ).getTime()
      ) {
        // last slot before holiday
        day += 1;
        hr = holidayHrs.startHr;
        min = 0;
      } else {
        // normal spring hrs
        // if last slot of the day
        if (
          apptDate.getHours() == springHrs[apptDate.getDay()].endHr &&
          apptDate.getMinutes() == endMin
        ) {
          // go to next day
          if (apptDate.getDate() == monthLength[apptDate.getMonth()]) {
            // go to beginning of next month
            month += 1;
            day = 1;
            hr = springHrs[new Date(year, month, day).getDay()].startHr;
            min = 0;
          } else {
            // add one to day of current month and reset time
            day += 1;
            hr = springHrs[new Date(year, month, day).getDay()].startHr;
            min = 0;
          }
        } else {
          // go to next slot of same day
          if (min != endMin) {
            min += apptLength;
          } else {
            hr += 1;
            min = 0;
          }
        }
      }

      // if summer
    } else {
      // summer hrs

      let dayBeforeJuly4th =
        new Date(year, holidays.july4th.month, holidays.july4th.day).getDay() -
        1;
      if (dayBeforeJuly4th < 0) {
        dayBeforeJuly4th = 6;
      }
      if (
        apptDate.getTime() ==
        new Date(
          year,
          holidays.july4th.month,
          holidays.july4th.day - 1,
          summerHrs[dayBeforeJuly4th].endHr,
          endMin
        ).getTime()
      ) {
        // start holiday
        day += 1;
        hr = holidayHrs.startHr;
        min = 0;
      } else {
        // normal summer hrs
        // if last slot of the day
        if (
          apptDate.getHours() == summerHrs[apptDate.getDay()].endHr &&
          apptDate.getMinutes() == endMin
        ) {
          // go to next day
          if (apptDate.getDate() == monthLength[apptDate.getMonth()]) {
            // go to beginning of next month
            month += 1;
            day = 1;
            hr = summerHrs[new Date(year, month, day).getDay()].startHr;
            min = 0;
          } else {
            // add one to day of current month and reset time
            day += 1;
            hr = summerHrs[new Date(year, month, day).getDay()].startHr;
            min = 0;
          }
        } else {
          // go to next slot of same day
          if (min != endMin) {
            min += apptLength;
          } else {
            hr += 1;
            min = 0;
          }
        }
      }
    }
  }
}

Appt.collection.insertMany(appts, (err, docs) => {
  if (err) {
    console.log(err);
  } else {
    Appt.find({}, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Database populated.");
        mongoose.connection.close();
      }
    });
  }
});
