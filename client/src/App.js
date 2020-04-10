import React, { useState, useEffect } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/Nav";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import MakeAppointment from "./components/MakeAppointment";
import MyAppointments from "./components/MyAppointments";
import DataPortal from "./components/DataPortal";
import CheckIn from "./components/CheckIn";
import UpdateInfo from "./components/UpdateInfo";
import ResetRequest from "./components/ResetRequest";
import EmailResetPass from "./components/EmailResetPass";
import NotFound from "./components/NotFound";
import "./App.css";

function App() {
  const customerLimit = 9;

  let [logged, setLogged] = useState(true);
  let [user, setUser] = useState({});
  let [appts, setAppts] = useState([]);

  useEffect(() => {
    getUser();
    getAppts();
    if (!window.localStorage.getItem("ma_id")) {
      setLogged(false);
    }
  }, [logged]);

  const getUser = () => {
    fetch("/api/getUser")
      .then((response) => response.json())
      .then((json) => {
        setUser(json);
      });
  };

  const getAppts = () => {
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datetime: new Date() }),
    };
    fetch("/api/getAppts", options)
      .then((response) => response.json())
      .then((json) => {
        if (json.error) {
          // console.log(json.error);
        } else {
          setAppts(json);
        }
      });
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Nav logged={logged} setLogged={setLogged} user={user} />
        <Switch>
          <ProtectedRoute
            exact
            path="/"
            component={Home}
            logged={logged}
            setLogged={setLogged}
            user={user}
            appts={appts}
          />
          <ProtectedRoute
            exact
            path="/makeAppointment"
            component={MakeAppointment}
            logged={logged}
            setLogged={setLogged}
            user={user}
            appts={appts}
          />
          <ProtectedRoute
            exact
            path="/myAppointments"
            component={MyAppointments}
            logged={logged}
            setLogged={setLogged}
            user={user}
            appts={appts}
          />
          <ProtectedRoute
            exact
            path="/dataPortal"
            component={DataPortal}
            logged={logged}
            setLogged={setLogged}
            user={user}
            appts={appts}
            customerLimit={customerLimit}
          />
          <ProtectedRoute
            exact
            path="/checkIn"
            component={CheckIn}
            logged={logged}
            setLogged={setLogged}
            user={user}
            appts={appts}
          />
          <ProtectedRoute
            exact
            path="/updateInfo"
            component={UpdateInfo}
            logged={logged}
            setLogged={setLogged}
            user={user}
            appts={appts}
          />
          <Route
            path="/register"
            exact
            render={(props) => <Register {...props} logged={logged} />}
          />
          <Route
            path="/login"
            exact
            render={(props) => (
              <Login
                {...props}
                logged={logged}
                setLogged={setLogged}
                setUser={setUser}
              />
            )}
          />
          <Route
            path="/resetRequest"
            exact
            render={(props) => <ResetRequest {...props} logged={logged} />}
          />
          <Route
            path="/emailResetPass/:token"
            render={(props) => <EmailResetPass {...props} logged={logged} />}
          />
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
