import React, { useState, useEffect } from "react";

const DataPortal = (props) => {
  const [filteredApptsStore, setFilteredApptsStore] = useState([]);
  const [filteredApptsMonth, setFilteredApptsMonth] = useState([]);
  const [filteredApptsDay, setFilteredApptsDay] = useState([]);
  const [lastFilterField, setLastFilterField] = useState("");
  const [displayData, setDisplayData] = useState("");
  const [userData, setUserData] = useState("");
  const [store, setStore] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [flashError, setFlashError] = useState("");

  useEffect(() => {
    let toDisplay = {};
    let stores = [
      ...new Set(props.appts.map((appt) => appt.store)),
    ].sort((a, b) => (a > b ? 1 : -1));
    for (let store of stores) {
      toDisplay[store] = { booked: 0, total: 0 };
    }
    for (let appt of props.appts) {
      toDisplay[appt.store].booked += appt.customers.length;
      if (appt.customers.length != 0) {
      }
      toDisplay[appt.store].total += props.customerLimit;
    }
    setDisplayData(toDisplay);
  }, [props.appts, props.customerLimit]);

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

  const handleStoreChange = (e) => {
    let storeFilter = props.appts.filter(
      (appt) => appt.store == e.target.value
    );
    setFilteredApptsStore(storeFilter);
    setLastFilterField(e.target.id);
    // display month: booked / total
    let toDisplay = {};
    let months = [
      ...new Set(storeFilter.map((appt) => appt.month)),
    ].sort((a, b) => (a.month > b.month ? 1 : -1));
    for (let month of months) {
      toDisplay[month] = { booked: 0, total: 0 };
    }
    for (let appt of storeFilter) {
      toDisplay[appt.month].booked += appt.customers.length;
      toDisplay[appt.month].total += props.customerLimit;
    }
    setDisplayData(toDisplay);
  };

  const handleMonthChange = (e) => {
    let monthFilter = filteredApptsStore.filter(
      (appt) => appt.month == e.target.value
    );
    monthFilter.sort((a, b) => (a.date > b.date ? 1 : -1));
    setFilteredApptsMonth(monthFilter);
    setLastFilterField(e.target.id);
    // display day: booked / total
    let toDisplay = {};
    let days = [...new Set(monthFilter.map((appt) => appt.day))];
    for (let day of days) {
      toDisplay[day] = { booked: 0, total: 0 };
    }
    for (let appt of monthFilter) {
      toDisplay[appt.day].booked += appt.customers.length;
      toDisplay[appt.day].total += props.customerLimit;
    }
    setDisplayData(toDisplay);
  };

  const handleDayChange = (e) => {
    let dayFilter = filteredApptsMonth.filter(
      (appt) => appt.day == e.target.value
    );
    dayFilter.sort((a, b) => (a.date > b.date ? 1 : -1));
    setFilteredApptsDay(dayFilter);
    setLastFilterField(e.target.id);
    // display time: booked / total;
    let toDisplay = {};
    let times = dayFilter;
    // dayFilter is list of appt objects
    for (let time of times) {
      let hr = time.hr;
      let min = time.min;
      let ampm = "AM";
      if (hr > 11) {
        ampm = "PM";
      }
      if (hr > 12) {
        hr -= 12;
      }
      if (min == 0) {
        min = "00";
      }
      let timeString = `${hr}:${min} ${ampm}`;

      toDisplay[timeString] = { booked: 0, total: props.customerLimit };
    }
    for (let appt of dayFilter) {
      let hr = appt.hr;
      let min = appt.min;
      let ampm = "AM";
      if (hr > 11) {
        ampm = "PM";
      }
      if (hr > 12) {
        hr -= 12;
      }
      if (min == 0) {
        min = "00";
      }
      let timeString = `${hr}:${min} ${ampm}`;
      toDisplay[timeString].booked += appt.customers.length;
    }
    setDisplayData(toDisplay);
  };

  const handleTimeChange = (e) => {
    // get user info for appt slot
    setLastFilterField(e.target.id);
    let hr = JSON.parse(e.target.value).hr;
    let min = JSON.parse(e.target.value).min;
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
          setDisplayData("");
          setUserData(json.customers);
        }
      });
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

  return (
    <div className="mb-5">
      {flashError ? (
        <div className="alert alert-danger">{flashError}</div>
      ) : null}
      <h1 className="mt-3">Appointment Data</h1>
      <form>
        <div className="form-group">
          <label htmlFor="store">Select location</label>
          <select
            className="form-control"
            id="store"
            defaultValue="DEFAULT"
            onChange={(e) => {
              resetFields(e);
              handleStoreChange(e);
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
              handleMonthChange(e);
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
                    <option key={month} value={month} className="option-full">
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
              handleDayChange(e);
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
              handleTimeChange(e);
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
        </div>
      </form>
      {displayData ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  {!lastFilterField
                    ? "Store"
                    : lastFilterField == "store"
                    ? "Month"
                    : lastFilterField == "month"
                    ? "Day"
                    : "Time"}
                </th>
                <th scope="col">Booked</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(displayData).map((key) => {
                if (lastFilterField == "store") {
                  console.log(displayData[key.booked]);
                  return (
                    <tr
                      key={key}
                      className={
                        displayData[key].booked === 0
                          ? "table-danger"
                          : displayData[key].booked === displayData[key].total
                          ? "table-success"
                          : ""
                      }
                    >
                      <td>{months[key]}</td>
                      <td>{displayData[key].booked}</td>
                      <td>{displayData[key].total}</td>
                    </tr>
                  );
                } else {
                  return (
                    <tr
                      key={key}
                      className={
                        displayData[key].booked == 0
                          ? "table-danger"
                          : displayData[key].booked == displayData[key].total
                          ? "table-success"
                          : ""
                      }
                    >
                      <td>{key}</td>
                      <td>{displayData[key].booked}</td>
                      <td>{displayData[key].total}</td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {lastFilterField !== "time" ? null : userData.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Email</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((customer) => (
                <tr key={customer.customer._id}>
                  <td>{customer.customer.firstName}</td>
                  <td>{customer.customer.lastName}</td>
                  <td>{customer.customer.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="h5 mt-5">This appointment slot is empty.</p>
      )}
    </div>
  );
};

export default DataPortal;
