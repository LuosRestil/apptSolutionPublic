import React from "react";
import UserHome from "./UserHome";
import AdminHome from "./AdminHome";

const Home = (props) => {
  let flashSuccess;
  try {
    flashSuccess = props.location.state.flashSuccess;
  } catch {}

  return (
    <div>
      {flashSuccess ? (
        <div className="alert alert-success">{flashSuccess}</div>
      ) : null}
      {props.user.role === "user" ? (
        <UserHome />
      ) : props.user.role === "admin" ? (
        <AdminHome />
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default Home;
