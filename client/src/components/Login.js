import React, { useState } from "react";
import { Redirect, Link } from "react-router-dom";

function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState({
    redirect: false,
    path: "",
    msg: "",
  });
  const [flashError, setFlashError] = useState("");

  let flashSuccess;
  try {
    flashSuccess = props.location.state.flashSuccess;
  } catch {}

  const handleSubmit = async (e) => {
    e.preventDefault();
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    };
    fetch("/api/login", options)
      .then((response) => response.json())
      .then((json) => {
        setEmail("");
        setPassword("");
        if (json.error) {
          props.location.state.flashSuccess = "";
          setFlashError(json.error);
        } else if (json.user) {
          props.setLogged(true);
          setRedirect({
            redirect: true,
            path: "/",
            msg: "Login successful!",
          });
        }
      });
  };

  if (redirect.redirect) {
    return (
      <Redirect
        to={{
          pathname: redirect.path,
        }}
      />
    );
  } else {
    return (
      <div>
        {flashSuccess ? (
          <div className="alert alert-success">{flashSuccess}</div>
        ) : flashError ? (
          <div className="alert alert-danger">{flashError}</div>
        ) : null}
        <h1 className="mt-3">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="emailField">Email</label>
            <input
              type="text"
              className="form-control"
              id="emailField"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passwordField">Password</label>
            <input
              type="password"
              className="form-control"
              id="passwordField"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
        <p className="mt-5">
          Forgot your password?{" "}
          <Link to="/resetRequest">Request password reset.</Link>
        </p>

        <p className="mt-3">
          Don't have an account yet? <Link to="/register">Register</Link>.
        </p>
      </div>
    );
  }
}

export default Login;
