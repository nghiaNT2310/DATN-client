import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import io from "socket.io-client"; // Add this
import "./App.css";
import Chat from "./pages/chat";
import SignInForm from "./pages/login";
import SignUpForm from "./pages/register";
import VideoRoomComponent from "./pages/videoroom";
//const socket = io.connect(process.env.REACT_APP_SOCKET);
const socket = io.connect(process.env.REACT_APP_SOCKET);
// const socket = io({
//   server: process.env.REACT_APP_SOCKET,
//   path: "/socket/",
// });
function App() {
  return (
    <Router>
      <Routes>
        <Route path="chat" element={<Chat socket={socket} />} />

        <Route path="register" element={<SignUpForm />} />

        <Route path="room" element={<VideoRoomComponent />} />

        <Route path="" element={<SignInForm socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
