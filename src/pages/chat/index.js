import { MainContainer } from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import MyChatContainer from "./chat-container";
import LeftSideBar from "./rooms-and-users";

const Chat = ({ socket }) => {
  const [chooseId, setChooseId] = useState("");
  const [isGroup, setIsGroup] = useState(true);
  const [user, setUser] = useState({});

  const getMyInfo = async () => {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "http://localhost:5000/user",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const myInfo = await axios.request(config);
      socket.emit("register-socket-id", myInfo.data._id);
      setUser(myInfo.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getMyInfo();
  }, []);

  useEffect(() => {
    socket.on("update-avatar", () => {
      getMyInfo();
    });

    return () => {
      socket.off("update-avatar");
    };
  }, [socket]);

  return (
    <div
      style={{
        height: "100%",
        position: "relative",
      }}
    >
      <MainContainer responsive>
        <LeftSideBar
          socket={socket}
          chooseId={chooseId}
          setChooseId={setChooseId}
          isGroup={isGroup}
          setIsGroup={setIsGroup}
          user={user}
        />

        <MyChatContainer
          socket={socket}
          chooseId={chooseId}
          isGroup={isGroup}
          user={user}
        />
      </MainContainer>
    </div>
  );
};

export default Chat;
