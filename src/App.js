import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import io from "socket.io-client"; // Add this
import "./App.css";
import Chat from "./pages/chat";
import SignInForm from "./pages/login";
import SignUpForm from "./pages/register";
import VideoRoomComponent from "./pages/videoroom";
const socket = io.connect("http://localhost:5000");
function App() {
  return (
    <Router>
      <Routes>
        {/* <Route
          exact
          path=""
          element={
            localStorage.getItem("token") ? (
              <Chat socket={socket} />
            ) : (
              <Navigate replace to={"/login"} />
            )
          }
        /> */}

        <Route path="chat" element={<Chat socket={socket} />} />

        <Route path="register" element={<SignUpForm />} />

        <Route path="room" element={<VideoRoomComponent />} />

        <Route path="" element={<SignInForm socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
