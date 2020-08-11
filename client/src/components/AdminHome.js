import React from "react";
import { Link } from "react-router-dom";

const AdminHome = props => {
  return (
    <div>
      <h1 className="mt-5">Welcome to McCoy's By Appointment!</h1>
      <h3 className="mt-5 mb-5">Would you like to...</h3>
      <ul className="user-home-list">
        <li className="user-home-list-item">
          <Link to="/checkIn" className="user-home-link h2 p-1">
            check in customers?
          </Link>
        </li>
        <li className="m-2 h4">or...</li>
        <li className="user-home-list-item">
          <Link to="/dataPortal" className="user-home-link h2 p-1">
            view appointment data?
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminHome;
