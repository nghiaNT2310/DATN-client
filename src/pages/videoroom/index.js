import "./VideoRoomComponent.css";
import React, { Component } from "react";

import axios from "axios";
import OpenViduSession from "openvidu-react";

class VideoRoomComponent extends Component {
  constructor(props) {
    super(props);
    this.APPLICATION_SERVER_URL =
      process.env.NODE_ENV === "production"
        ? ""
        : `${process.env.REACT_APP_ENDPOINT}/`;
    // const APPLICATION_SERVER_URL =
    //   process.env.NODE_ENV === "production" ? "" : "https://demos.openvidu.io/";
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
    const roomId = urlParams.get("roomId");
    this.state = {
      mySessionId: roomId,
      myUserName: username,
      token: undefined,
    };

    this.handlerJoinSessionEvent = this.handlerJoinSessionEvent.bind(this);
    this.handlerLeaveSessionEvent = this.handlerLeaveSessionEvent.bind(this);
    this.handlerErrorEvent = this.handlerErrorEvent.bind(this);
    this.joinSession = this.joinSession.bind(this);
  }
  async componentDidMount() {
    await this.joinSession();
  }

  handlerJoinSessionEvent() {
    console.log("Join session");
  }

  handlerLeaveSessionEvent() {
    console.log("Leave session");
    this.setState({
      session: undefined,
    });
  }

  handlerErrorEvent() {
    console.log("Leave session");
  }

  async joinSession() {
    if (this.state.mySessionId && this.state.myUserName) {
      console.log(this.state);
      const token = await this.getToken();
      this.setState({
        token: token,
        session: true,
      });
    }
  }

  render() {
    const mySessionId = this.state.mySessionId;
    const myUserName = this.state.myUserName;
    const token = this.state.token;
    return (
      <div>
        {mySessionId && (
          <div id="session">
            <OpenViduSession
              id="opv-session"
              sessionName={mySessionId}
              user={myUserName}
              token={token}
              joinSession={this.handlerJoinSessionEvent}
              leaveSession={this.handlerLeaveSessionEvent}
              error={this.handlerErrorEvent}
            />
          </div>
        )}
      </div>
    );
  }

  /**
   * --------------------------------------------
   * GETTING A TOKEN FROM YOUR APPLICATION SERVER
   * --------------------------------------------
   * The methods below request the creation of a Session and a Token to
   * your application server. This keeps your OpenVidu deployment secure.
   *
   * In this sample code, there is no user control at all. Anybody could
   * access your application server endpoints! In a real production
   * environment, your application server must identify the user to allow
   * access to the endpoints.
   *
   * Visit https://docs.openvidu.io/en/stable/application-server to learn
   * more about the integration of OpenVidu in your application server.
   */
  async getToken() {
    const sessionId = await this.createSession(this.state.mySessionId);
    return await this.createToken(sessionId);
  }

  async createSession(sessionId) {
    const response = await axios.post(
      this.APPLICATION_SERVER_URL + "api/sessions",
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The sessionId
  }

  async createToken(sessionId) {
    const response = await axios.post(
      this.APPLICATION_SERVER_URL +
        "api/sessions/" +
        sessionId +
        "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The token
  }
}
export default VideoRoomComponent;
