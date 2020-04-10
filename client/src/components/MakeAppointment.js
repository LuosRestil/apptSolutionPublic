import React, { useState } from "react";
import { Redirect, Link } from "react-router-dom";

const MakeAppointment = (props) => {
  const [filteredApptsStore, setFilteredApptsStore] = useState([]);
  const [filteredApptsMonth, setFilteredApptsMonth] = useState([]);
  const [filteredApptsDay, setFilteredApptsDay] = useState([]);
  const [lastFilterField, setLastFilterField] = useState("");
  const [store, setStore] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [flashError, setFlashError] = useState("");
  const [redirect, setRedirect] = useState("");

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

  const makeAppt = (e) => {
    e.preventDefault();
    let hr = JSON.parse(time).hr;
    let min = JSON.parse(time).min;
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store: store,
        month: parseInt(month),
        day: parseInt(day),
        hr: hr,
        min: min,
      }),
    };
    fetch("/api/makeAppt", options)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setFlashError(json.error);
        } else {
          setRedirect({
            redirect: true,
            path: "/myAppointments",
            msg: json.msg,
          });
        }
      });
  };

  const filterApptsByStore = (e) => {
    let storeFilter = props.appts.filter(
      (appt) => appt.store === e.target.value
    );
    setFilteredApptsStore(storeFilter);
    setLastFilterField(e.target.id);
  };

  const filterApptsByMonth = (e) => {
    let monthFilter = filteredApptsStore.filter(
      (appt) => appt.month == e.target.value
    );
    monthFilter.sort((a, b) => (a.date > b.date ? 1 : -1));
    setFilteredApptsMonth(monthFilter);
    setLastFilterField(e.target.id);
  };

  const filterApptsByDay = (e) => {
    let dayFilter = filteredApptsMonth.filter(
      (appt) => appt.day == e.target.value
    );
    dayFilter.sort((a, b) => (a.date > b.date ? 1 : -1));
    setFilteredApptsDay(dayFilter);
    setLastFilterField(e.target.id);
  };

  const resetFields = (e) => {
    switch (e.target.id) {
      case "store":
        // reset month, day, time to default
        document.getElementById("month").value = "DEFAULT";
        document.getElementById("day").value = "DEFAULT";
        document.getElementById("time").value = "DEFAULT";
        break;
      case "month":
        // reset day, time to default
        document.getElementById("day").value = "DEFAULT";
        document.getElementById("time").value = "DEFAULT";
        break;
      case "day":
        // reset time to default
        document.getElementById("time").value = "DEFAULT";
        break;
      default:
        break;
    }
  };

  if (redirect.redirect) {
    return (
      <Redirect
        to={{
          pathname: redirect.path,
          state: { flashSuccess: redirect.msg },
        }}
      />
    );
  } else {
    return (
      <div className="mb-5">
        {flashError ? (
          <div className="alert alert-danger">{flashError}</div>
        ) : null}
        <h1 className="mt-3">New Appointment</h1>
        <form onSubmit={makeAppt}>
          <div className="form-group">
            <label htmlFor="store">
              Which location would you like to visit?
            </label>
            <select
              className="form-control"
              id="store"
              defaultValue="DEFAULT"
              onChange={(e) => {
                resetFields(e);
                filterApptsByStore(e);
                setStore(e.target.value);
              }}
              required
            >
              <option value="DEFAULT" disabled>
                Select location
              </option>
              <option value="Chattanooga">Chattanooga</option>
              <option value="Greensboro">Greensboro</option>
              <option value="Knoxville">Knoxville</option>
              <option value="Nashville">Nashville</option>
              <option value="Winston-Salem">Winston-Salem</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="month">Select month</label>
            <select
              className="form-control"
              id="month"
              defaultValue="DEFAULT"
              onChange={(e) => {
                resetFields(e);
                filterApptsByMonth(e);
                setMonth(e.target.value);
              }}
              required
              disabled={
                !["day", "time", "month", "store"].includes(lastFilterField)
              }
            >
              <option value="DEFAULT" disabled>
                Month
              </option>
              {[...new Set(filteredApptsStore.map((appt) => appt.month))].map(
                (month) => {
                  let monthArr = filteredApptsStore.filter(
                    (appt) => appt.month == month
                  );
                  if (monthArr.every((i) => i.full === true)) {
                    return (
                      <option
                        key={month}
                        value={month}
                        className="option-full"
                        disabled
                      >
                        {months[month]} (full)
                      </option>
                    );
                  } else {
                    return (
                      <option key={month} value={month}>
                        {months[month]}
                      </option>
                    );
                  }
                }
              )}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="day">Select day</label>
            <select
              className="form-control"
              id="day"
              defaultValue="DEFAULT"
              onChange={(e) => {
                resetFields(e);
                filterApptsByDay(e);
                setDay(e.target.value);
              }}
              required
              disabled={!["day", "time", "month"].includes(lastFilterField)}
            >
              <option value="DEFAULT" disabled>
                Day
              </option>
              {[...new Set(filteredApptsMonth.map((appt) => appt.day))].map(
                (day) => {
                  let dayArr = filteredApptsMonth.filter(
                    (appt) => appt.day == day
                  );
                  if (dayArr.every((i) => i.full === true)) {
                    return (
                      <option
                        key={day}
                        value={day}
                        className="option-full"
                        disabled
                      >
                        {day} (full)
                      </option>
                    );
                  } else {
                    return (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    );
                  }
                }
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="time">Select time</label>
            <select
              className="form-control"
              id="time"
              defaultValue="DEFAULT"
              onChange={(e) => {
                setTime(e.target.value);
              }}
              required
              disabled={!["day", "time"].includes(lastFilterField)}
            >
              <option value="DEFAULT" disabled>
                Time
              </option>
              {filteredApptsDay.map((appt) => {
                let ampm = "AM";
                let hr = appt.hr;
                let min = appt.min;
                if (appt.min === 0) {
                  min = "00";
                }
                if (appt.hr > 11) {
                  ampm = "PM";
                }
                if (appt.hr > 12) {
                  hr = appt.hr - 12;
                }
                if (appt.full) {
                  return (
                    <option
                      key={appt._id}
                      value={JSON.stringify({ hr: appt.hr, min: appt.min })}
                      className="option-full"
                      disabled
                    >
                      {hr}:{min} {ampm} (full)
                    </option>
                  );
                } else {
                  return (
                    <option
                      key={appt._id}
                      value={JSON.stringify({ hr: appt.hr, min: appt.min })}
                    >
                      {hr}:{min} {ampm}
                    </option>
                  );
                }
              })}
            </select>
            <button type="submit" className="btn btn-primary mt-4 p-2">
              Submit
            </button>
          </div>
        </form>
        <div>
          <p>
            Not sure what appointments you already have?{" "}
            <Link to="/myAppointments">View your appointments.</Link>
          </p>
        </div>
      </div>
    );
  }
};

export default MakeAppointment;
