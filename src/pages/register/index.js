import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { DOMAIN, PATH } from "../../const/url";
import "./styles.css";

function SignUp() {
  // React States
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  // User Login info

  const handleSubmit = async (event) => {
    //Prevent page reload
    try {
      event.preventDefault();
      if (password !== repeatPassword) {
        setErrorMessages({ name: "repeat-password", message: "No match" });
        return;
      }
      let response = await axios.post(DOMAIN + PATH.SIGN_UP, {
        username,
        password,
      });
      if (response.data.code === 5) {
        setErrorMessages({ name: "username", message: response.data.message });
        return;
      }

      response = await axios.post(DOMAIN + PATH.SIGN_IN, {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  // Generate JSX code for error message
  const renderErrorMessage = (name) =>
    name === errorMessages.name && (
      <div className="error">{errorMessages.message}</div>
    );

  return (
    <div className="app">
      <div className="login-form">
        <div className="logo">
          <img src={logo} className="logo-img" alt="Business view - Reports" />
        </div>
        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="text"
                className="input-normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
              {renderErrorMessage("username")}
            </div>
            <div className="input-container">
              <input
                type="password"
                className="input-normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              {renderErrorMessage("password")}
            </div>
            <div className="input-container">
              <input
                type="password"
                className="input-normal"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder="Repeat your password"
                required
              />
              {renderErrorMessage("repeat-password")}
            </div>
            <div className="button-container">
              <input type="submit" className="input-submit" value={"Sign up"} />
            </div>
            <div className="link-sign-in-container">
              <p
                className="link-sign-in"
                onClick={() => {
                  navigate("/", { replace: true });
                }}
              >
                Sign in
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
