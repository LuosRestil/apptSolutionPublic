import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MyAppointments = (props) => {
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

  let [appts, setAppts] = useState([]);
  let [noAppts, setNoAppts] = useState(false);
  let [flashError, setFlashError] = useState("");
  let [flashSuccess, setFlashSuccess] = useState("");
  let [toCancel, setToCancel] = useState("");

  useEffect(() => {
    getUserAppts();
    try {
      if (props.location.state.flashSuccess) {
        setFlashSuccess(props.location.state.flashSuccess);
      }
    } catch {}
  }, []);

  const getUserAppts = () => {
    fetch("/api/getUserAppts")
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setFlashError(json.error);
        } else {
          if (json.length > 0) {
            json.sort((a, b) => (a.date > b.date ? 1 : -1));
            setAppts(json);
          } else {
            setNoAppts(true);
          }
        }
      });
  };

  const cancelAppt = (e) => {
    e.preventDefault();
    fetch(`/api/userCancelAppt/${toCancel}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((json) => {
        setToCancel("");
        document.getElementById("apptsField").value = "DEFAULT";
        if (json.error) {
          console.log(json.error);
        } else {
          setFlashSuccess(json.msg);
          getUserAppts();
        }
      });
  };

  return (
    <div className="mb-5">
      {flashError ? (
        <div className="alert alert-danger">{flashError}</div>
      ) : flashSuccess ? (
        <div className="alert alert-success">{flashSuccess}</div>
      ) : null}
      <h1 className="mt-3">My Appointments</h1>
      {noAppts ? (
        <div className="m-5">
          <p className="h3">
            It looks like you don't have any appointments yet.
          </p>
          <p className="h3">
            You can make one <Link to="/makeAppointment">here</Link>.
          </p>
        </div>
      ) : appts.length > 0 ? (
        <div className="mt-5">
          <p className="h3">You have appointments for...</p>
          {appts.map((appt) => (
            <div key={appt._id}>
              <p className="h4">
                {months[appt.month]} {appt.day} at{" "}
                {appt.hr > 12 ? appt.hr - 12 : appt.hr}:
                {appt.min === 0 ? "00" : appt.min} {appt.hr < 12 ? "AM" : "PM"},{" "}
                {appt.store}
              </p>
            </div>
          ))}
          <p>
            <Link to="/makeAppointment">Make another appointment?</Link>
          </p>
          <p className="h5">
            Can't make it? Please let us know! You can cancel an appointment
            below.
          </p>
          <form
            onSubmit={(e) => {
              if (
                window.confirm(
                  "Are you sure you want to cancel this appointment?"
                )
              )
                cancelAppt(e);
            }}
          >
            <div className="form-group">
              <select
                className="form-control"
                id="apptsField"
                defaultValue={"DEFAULT"}
                onChange={(e) => setToCancel(e.target.value)}
                required
              >
                <option value="DEFAULT" disabled>
                  Select appointment
                </option>
                {appts.map((appt) => (
                  <option value={appt._id} key={appt._id}>
                    {months[appt.month]} {appt.day},{" "}
                    {appt.hr > 12 ? appt.hr - 12 : appt.hr}:
                    {appt.min === 0 ? "00" : appt.min}{" "}
                    {appt.hr < 12 ? "AM" : "PM"}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-danger mt-2">Cancel Appointment</button>
          </form>
        </div>
      ) : (
        <div className="mt-5 h3 loading">Loading...</div>
      )}
    </div>
  );
};

export default MyAppointments;
