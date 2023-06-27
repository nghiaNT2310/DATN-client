import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { DOMAIN, PATH } from "../../const/url";

import "./styles.css";

function SignIn({ socket }) {
  // React States
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState({});
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // User Login info

  const handleSubmit = async (event) => {
    console.log(process.env);
    //Prevent page reload
    try {
      event.preventDefault();
      const response = await axios.post(DOMAIN + PATH.SIGN_IN, {
        username,
        password,
      });
      if (response.data.code === 3) {
        setErrorMessages({ name: "username", message: response.data.message });
        return;
      }

      if (response.data.code === 4) {
        setErrorMessages({ name: "password", message: response.data.message });
        return;
      }

      localStorage.setItem("token", response.data.result.token);
      navigate("/chat", { replace: true });
      return;
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
            <div className="button-container">
              <input type="submit" className="input-submit" value={"Sign in"} />
            </div>
            <div className="link-sign-up-container">
              <p
                className="link-sign-up"
                onClick={() => {
                  navigate("/register", { replace: true });
                }}
              >
                Sign up
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
