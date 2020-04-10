import React from "react";
import { Link } from "react-router-dom";

const UserHome = props => {
  return (
    <div>
      <h1 className="mt-5">Welcome to McKay's By Appointment!</h1>
      <h3 className="mt-5 mb-5">Would you like to...</h3>
      <ul className="user-home-list">
        <li className="user-home-list-item">
          <Link to="/makeAppointment" className="user-home-link h2 p-1">
            make an appointment?
          </Link>
        </li>
        <li className="m-2 h4">or...</li>
        <li className="user-home-list-item">
          <Link to="/myAppointments" className="user-home-link h2 p-1">
            view your appointments?
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default UserHome;
