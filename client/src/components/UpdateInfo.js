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
  const [passUpper, setPassUpper] = useState(false);
  const [passLower, setPassLower] = useState(false);
  const [passNum, setPassNum] = useState(false);
  const [passSymbol, setPassSymbol] = useState(false);
  const [passLongEnough, setPassLongEnough] = useState(false);

  const lc = "abcdefghijklmnopqrstuvwxyz";
  const uc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "1234567890";
  const symbols = [
    '"',
    "'",
    "@",
    "%",
    "+",
    "-",
    "/",
    "\\",
    "/",
    "!",
    "#",
    "$",
    "^",
    "?",
    ":",
    ",",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "~",
    "`",
    "_",
    "-",
    ".",
    "*",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validPass =
      passUpper && passLower && passNum && passSymbol && passLongEnough;
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
        validPass: validPass,
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

  const updatePwReqs = (pass) => {
    let pwUpper = false;
    let pwLower = false;
    let pwNum = false;
    let pwSymbol = false;
    let pwLongEnough = false;
    if (pass.length >= 8) {
      pwLongEnough = true;
    }
    for (let char of pass) {
      if (lc.includes(char)) {
        pwLower = true;
      } else if (uc.includes(char)) {
        pwUpper = true;
      } else if (nums.includes(char)) {
        pwNum = true;
      } else if (symbols.includes(char)) {
        pwSymbol = true;
      }
    }
    setPassLower(pwLower);
    setPassUpper(pwUpper);
    setPassNum(pwNum);
    setPassSymbol(pwSymbol);
    setPassLongEnough(pwLongEnough);
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
              onChange={(e) => {
                setOption(e.target.value);
                setEmail("");
                setConfirmEmail("");
                setPhone("");
                setConfirmPhone("");
                setNewPassword("");
                setConfirmNewPassword("");
              }}
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
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  updatePwReqs(e.target.value);
                }}
                value={newPassword}
                required
              />
              <div className="pw-reqs-container">
                <ul className="pw-reqs mt-2">
                  <li>
                    <i
                      className={`fas mr-2 ${
                        passLongEnough
                          ? "fa-check-circle green"
                          : "fa-times-circle red"
                      }`}
                      id="pw-long-enough"
                    ></i>
                    Minimum 8 characters
                  </li>
                  <li>
                    <i
                      className={`fas mr-2 ${
                        passLower
                          ? "fa-check-circle green"
                          : "fa-times-circle red"
                      }`}
                      id="pw-lower"
                    ></i>
                    Lowercase letter
                  </li>
                  <li>
                    <i
                      className={`fas mr-2 ${
                        passUpper
                          ? "fa-check-circle green"
                          : "fa-times-circle red"
                      }`}
                      id="pw-upper"
                    ></i>
                    Uppercase letter
                  </li>
                  <li>
                    <i
                      className={`fas mr-2 ${
                        passNum
                          ? "fa-check-circle green"
                          : "fa-times-circle red"
                      }`}
                      id="pw-num"
                    ></i>
                    Number
                  </li>
                  <li>
                    <i
                      className={`fas mr-2 ${
                        passSymbol
                          ? "fa-check-circle green"
                          : "fa-times-circle red"
                      }`}
                      id="pw-symbol"
                    ></i>
                    Symbol
                  </li>
                </ul>
              </div>
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
