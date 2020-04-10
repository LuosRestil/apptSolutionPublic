import React, { useState } from "react";
import { Redirect } from "react-router-dom";

const UpdateInfo = (props) => {
  const [password, setPassword] = useState("");
  const [option, setOption] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPhone, setConfirmPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [flashError, setFlashError] = useState("");
  const [redirect, setRedirect] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: password,
        option: option,
        email: email,
        confirmEmail: confirmEmail,
        phone: phone,
        confirmPhone: confirmPhone,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      }),
    };
    fetch("/api/updateUserInfo", options)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setPassword("");
          setOption("");
          document.getElementById("optionsField").value = "DEFAULT";
          setEmail("");
          setConfirmEmail("");
          setPhone("");
          setConfirmPhone("");
          setNewPassword("");
          setConfirmNewPassword("");
          setFlashError(json.error);
        } else if (json.msg) {
          setRedirect({
            redirect: true,
            path: "/",
            msg: json.msg,
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
        <h1 className="mt-3">Update Info</h1>
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="form-group">
            <label htmlFor="passwordField">Current Password (required)</label>
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
            <label htmlFor="optionsField">What would you like to update?</label>
            <select
              className="form-control"
              id="optionsField"
              defaultValue={"DEFAULT"}
              onChange={(e) => setOption(e.target.value)}
              required
            >
              <option value="DEFAULT" disabled>
                Select option
              </option>
              <option value="email">Email</option>
              <option value="phone">Phone number</option>
              <option value="newPassword">Password</option>
            </select>
          </div>
          {option === "email" ? (
            <div className="form-group">
              <label htmlFor="emailField">New Email</label>
              <input
                type="email"
                className="form-control"
                id="emailField"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              <label htmlFor="confirmEmailField" className="mt-3">
                Confirm New Email
              </label>
              <input
                type="email"
                className="form-control"
                id="confirmEmailField"
                onChange={(e) => setConfirmEmail(e.target.value)}
                value={confirmEmail}
                required
              />
            </div>
          ) : option === "phone" ? (
            <div className="form-group">
              <label htmlFor="phoneField">New Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="newPhoneField"
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                required
                placeholder="ex. 555-123-4567"
              />
              <label htmlFor="confirmPhoneField" className="mt-3">
                Confirm New Phone Number
              </label>
              <input
                type="tel"
                className="form-control"
                id="confirmNewPhoneField"
                onChange={(e) => setConfirmPhone(e.target.value)}
                value={confirmPhone}
                required
              />
            </div>
          ) : option === "newPassword" ? (
            <div className="form-group">
              <label htmlFor="newPasswordField">New Password</label>
              <input
                type="password"
                className="form-control"
                id="newPasswordField"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                required
              />
              <label htmlFor="passwordField" className="mt-3">
                Confirm New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmNewPasswordField"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                value={confirmNewPassword}
                required
              />
            </div>
          ) : null}

          {option ? (
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          ) : null}
        </form>
      </div>
    );
  }
};

export default UpdateInfo;
