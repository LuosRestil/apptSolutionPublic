import React, { useState, useEffect } from "react";

const MakeAppointment = (props) => {
  const [filteredAppts, setFilteredAppts] = useState([]);
  const [filteredApptsStore, setFilteredApptsStore] = useState([]);
  const [filteredApptsMonth, setFilteredApptsMonth] = useState([]);
  const [filteredApptsDay, setFilteredApptsDay] = useState([]);
  const [lastFilterField, setLastFilterField] = useState("");
  const [store, setStore] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [display, setDisplay] = useState("");
  const [flashError, setFlashError] = useState("");

  useEffect(() => {
    setFilteredAppts(props.appts);
  }, [props.appts]);

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

  const handleSubmit = (e) => {
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
    fetch("/api/getCustomerData", options)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setFlashError(json.error);
        } else {
          // display data
          setDisplay(json.customers);
        }
      });
  };

  const filterApptsByStore = (e) => {
    let storeFilter = filteredAppts.filter(
      (appt) => appt.store == e.target.value
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

  const handleCheck = (e, customer) => {
    e.preventDefault();
    let checkIn = true;
    if (e.target.classList.contains("green")) {
      checkIn = false;
    }
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkIn: checkIn,
        customer: customer,
      }),
    };
    fetch("/api/toggleCheckin", options)
      .then((response) => response.json())
      .then((json) => {
        setDisplay(json.customers);
      });
  };

  const handleCancel = (e, customer) => {
    e.preventDefault();
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: customer,
      }),
    };
    fetch("/api/adminCancelAppt", options)
      .then((response) => response.json())
      .then((json) => {
        setDisplay(json.customers);
      });
  };

  const resetFields = (e) => {
    switch (e.target.id) {
      case "store":
        // reset month, day, time to default
        document.getElementById("month").value = "DEFAULT";
        document.getElementById("day").value = "DEFAULT";
        document.getElementById("time").value = "DEFAULT";
        setDisplay("");
        break;
      case "month":
        // reset day, time to default
        document.getElementById("day").value = "DEFAULT";
        document.getElementById("time").value = "DEFAULT";
        setDisplay("");
        break;
      case "day":
        // reset time to default
        document.getElementById("time").value = "DEFAULT";
        setDisplay("");
        break;
      default:
        break;
    }
  };

  return (
    <div className="mb-5">
      {flashError ? (
        <div className="alert alert-danger">{flashError}</div>
      ) : null}
      <h1 class="mt-3">Check-In</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="store">Select Location</label>
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
              Location
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
                    <option key={month} value={month}>
                      {months[month]} (full)
                    </option>
                  );
                } else if (monthArr.every((i) => i.customers.length === 0)) {
                  return (
                    <option key={month} value={month}>
                      {months[month]} (empty)
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
                    <option key={day} value={day}>
                      {day} (full)
                    </option>
                  );
                } else if (dayArr.every((i) => i.customers.length === 0)) {
                  return (
                    <option key={day} value={day}>
                      {day} (empty)
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
                  >
                    {hr}:{min} {ampm} (full)
                  </option>
                );
              } else if (appt.customers.length === 0) {
                return (
                  <option
                    key={appt._id}
                    value={JSON.stringify({ hr: appt.hr, min: appt.min })}
                  >
                    {hr}:{min} {ampm} (empty)
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
            Load Appointments
          </button>
        </div>
      </form>
      {!display ? null : display.length === 0 ? (
        <p className="h5 mt-5">This appointment slot is empty.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th scope="col">First</th>
              <th scope="col">Last</th>
              <th scope="col">Email</th>
              <th scope="col">CheckIn</th>
              <th scope="col">Cancel</th>
            </tr>
          </thead>
          <tbody>
            {display.map((customer) => (
              <tr key={customer.customer._id}>
                <td>{customer.customer.firstName}</td>
                <td>{customer.customer.lastName}</td>
                <td>{customer.customer.email}</td>
                <td>
                  <i
                    onClick={(e) => {
                      handleCheck(e, customer);
                    }}
                    className={
                      customer.checkedIn
                        ? "fas fa-check checkin-icon green"
                        : "far fa-circle checkin-icon"
                    }
                  ></i>
                </td>
                <td>
                  <i
                    className="fas fa-times checkin-icon red"
                    onClick={(e) => {
                      if (
                        window.confirm(
                          "Are you sure you want to cancel this customer's appointment?"
                        )
                      )
                        handleCancel(e, customer);
                    }}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MakeAppointment;
