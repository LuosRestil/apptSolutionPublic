import React from "react";
import { Link } from "react-router-dom";

const Nav = (props) => {
  const logout = () => {
    fetch("/api/logout").then(() => {
      props.setLogged(false);
    });
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary">
      <Link to="/" className="navbar-brand">
        <div>
          <p className="logo-primary">McCoy's</p>
          <p className="logo-secondary">By Appointment</p>
        </div>
      </Link>

      {props.logged ? (
        <p className="username mr-3 ml-auto font-weight-bold">
          Welcome, {props.user.firstName}!
        </p>
      ) : null}
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      {props.logged && props.user.role === "user" ? (
        <div
          className="collapse navbar-collapse flex-grow-0"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/updateInfo">
                Update Info
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-link" onClick={logout}>
                Log Out
              </button>
            </li>
          </ul>
        </div>
      ) : props.logged && props.user.role === "admin" ? (
        <div
          className="collapse navbar-collapse flex-grow-0"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/checkIn">
                Check-in
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dataPortal">
                Data
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-link" onClick={logout}>
                Log Out
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <div
          className="collapse navbar-collapse flex-grow-0 ml-auto"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/register">
                Register
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Nav;
