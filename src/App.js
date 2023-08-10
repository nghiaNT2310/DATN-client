import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import io from "socket.io-client"; // Add this
import "./App.css";
import Chat from "./pages/chat";
import SignInForm from "./pages/login";
import SignUpForm from "./pages/register";
//import VideoRoomComponent from "./pages/videoroom";
import ThankPage from "./pages/thankyou";
import VideoRoomComponent from "./pages/videocall/components/VideoRoomComponent";
//const socket = io.connect(process.env.REACT_APP_SOCKET);
//const socket = io.connect(process.env.REACT_APP_SOCKET);
const socket = io(process.env.REACT_APP_LINKVIDEOCALL, {
  path: "/test/",
  query: {token:localStorage.getItem("token")}
});
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

        {/* <Route path="room" element={<VideoRoomComponent />} /> */}
        <Route path="room" element={<VideoRoomComponent />} />

        <Route path="thank" element={<ThankPage />} />

        <Route path="" element={<SignInForm socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;
