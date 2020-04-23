import React, { useState } from "react";
import { Redirect } from "react-router-dom";

function EmailResetPass(props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [redirect, setRedirect] = useState({
    redirect: false,
    path: "",
    msg: "",
  });
  const [flashError, setFlashError] = useState("");
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
        confirmPassword: confirmPassword,
        token: props.match.params.token,
        validPass: validPass,
      }),
    };
    fetch("/api/emailResetPass", options)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          setFlashError(json.error);
        } else {
          setRedirect({ redirect: true, path: "/login", msg: json.msg });
        }
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
        <h1 className="mt-3">Reset Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="passwordField">New Password</label>
            <input
              type="password"
              className="form-control"
              id="passwordField"
              onChange={(e) => {
                setPassword(e.target.value);
                updatePwReqs(e.target.value);
              }}
              value={password}
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
                      passNum ? "fa-check-circle green" : "fa-times-circle red"
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
          </div>
          <div className="form-group">
            <label htmlFor="passwordField">Confirm New Password</label>
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
      </div>
    );
  }
}

export default EmailResetPass;
