import React, { useState } from "react";
import { Redirect, Link } from "react-router-dom";

function Register(props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [redirect, setRedirect] = useState({
    redirect: false,
    path: "",
    msg: "",
  });
  const [flashError, setFlashError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password,
        confirmPassword: confirmPassword,
      }),
    };
    fetch("/api/register", options)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setFlashError(json.error);
          if (json.error === "Password confirmation does not match password.") {
            setPassword("");
            setConfirmPassword("");
          } else if (json.error === "That email is already in use.") {
            setEmail("");
          } else if (
            json.error === "That phone number is already in use." ||
            json.error === "Phone number must contain 10 or 11 digits."
          ) {
            setPhone("");
          }
        } else if (json.msg) {
          setRedirect({
            redirect: true,
            path: "/login",
            msg: "Registration successful! You may now log in.",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
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
      <div>
        {flashError ? (
          <div className="alert alert-danger">{flashError}</div>
        ) : null}
        <h1 className="mt-3">Registration</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstNameField">First Name</label>
            <input
              type="username"
              className="form-control"
              id="firstNameField"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastNameField">Last Name</label>
            <input
              type="username"
              className="form-control"
              id="lastNameField"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="emailField">Email</label>
            <input
              type="email"
              className="form-control"
              id="emailField"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneField">Phone Number (optional)</label>
            <input
              type="tel"
              className="form-control"
              id="phoneField"
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              placeholder="ex. 555-123-4567"
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
          <div className="form-group">
            <label htmlFor="passwordField">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPasswordField"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
        <p className="mt-4">
          Already have an account? <Link to="/login">Log in</Link>.
        </p>
      </div>
    );
  }
}

export default Register;
