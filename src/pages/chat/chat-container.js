import {
  Avatar,
  ChatContainer,
  ConversationHeader,
  EllipsisButton,
  Message,
  MessageInput,
  MessageList,
  VideoCallButton,
  VoiceCallButton,
  InputToolbox,
  SendButton,
  AttachmentButton,
} from "@chatscope/chat-ui-kit-react";
import axios from "axios";
import { useEffect, useState } from "react";
import avatar from "../../assets/avata.svg";
import { BsPersonFillAdd } from "react-icons/bs";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import dateHelper from "../../util/date";
import { GiCancel } from "react-icons/gi";
import cancelIcon from "../../assets/avata.svg";

const MyChatContainer = ({ socket, chooseId, isGroup, user }) => {
  const [messageInputValue, setMessageInputValue] = useState("");
  const [messages, setMessage] = useState([]);
  const [show, setShow] = useState(false);
  const [listFriendNotInGroup, setListFriendNotInGroup] = useState([]);
  const [isFile, setIsFile] = useState(false);
  const [file, setFile] = useState();
  const [height, setHeight] = useState("570px");
  const [info, setInfo] = useState({
    username: "",
    avatar: "",
  });

  const handleClose = () => setShow(false);
  const handleShow = async () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `http://localhost:5000/group-user/${chooseId}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    const response = await axios.request(config);

    setListFriendNotInGroup(
      response.data.map((e) => {
        return {
          ...e,
          checked: false,
        };
      })
    );
    setShow(true);
  };

  const handleCallButton = async () => {
    let roomId;
    if (isGroup) {
      roomId = chooseId;
    } else {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://localhost:5000/friend?id1=${user._id}&id2=${chooseId}`,
        headers: {},
      };
      const friendId = await axios.request(config);
      roomId = friendId.data;
    }
    const url = `${window.location.protocol}//${window.location.host}/room?username=${user.username}&roomId=${roomId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    socket.on("new-message-chat-container", (data) => {
      if (data.chooseId == chooseId && isGroup == data.isGroup) {
        setMessage((pre) => [...pre, data.message]);
      }
    });

    return () => {
      socket.off("new-message-chat-container");
    };
  }, [socket, chooseId, isGroup]);

  useEffect(() => {
    if (chooseId) {
      getMessage();
      getInfo();
    }
  }, [chooseId, isGroup]);

  const getMessage = async () => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://localhost:5000/message/friend/${chooseId}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
      if (isGroup)
        config.url = `http://localhost:5000/message/group/${chooseId}`;

      const message = await axios.request(config);
      setMessage(message.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getInfo = async () => {
    try {
      if (isGroup) {
        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `http://localhost:5000/group/${chooseId}`,
          headers: {},
        };

        const data = await axios.request(config);
        setInfo({
          name: data.data.name,
          avatar: data.data.avatar,
        });
      } else {
        let config = {
          method: "get",
          maxBodyLength: Infinity,
          url: `http://localhost:5000/info/friend/${chooseId}`,
          headers: {},
        };

        const data = await axios.request(config);
        setInfo({
          name: data.data.username,
          avatar: data.data.avatar,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleClickCheckBox = (friendId) => {
    setListFriendNotInGroup((pre) => {
      return pre.map((e) => {
        if (e.friendId == friendId) {
          return {
            ...e,
            checked: !e.checked,
          };
        } else return e;
      });
    });
  };

  const handleAddUserToGroup = () => {
    const ids = listFriendNotInGroup
      .filter((e) => e.checked)
      .map((e) => e.friendId);
    socket.emit("add-user-to-group", { ids, groupId: chooseId });
    setShow(false);
  };

  const handleSendMessage = () => {
    console.log(file);
    if (!isGroup) {
      socket.emit("send-message-to-user", {
        creator: user._id,
        recipientId: chooseId,
        messageBody: messageInputValue,
        isFile: isFile,
        file: file,
        metadata: isFile
          ? {
              name: file.name,
              type: file.type,
            }
          : null,
      });
    } else {
      socket.emit("send-message-to-group", {
        creator: user._id,
        cecipientGroupId: chooseId,
        messageBody: messageInputValue,
        isFile: isFile,
        file: file,
        metadata: isFile
          ? {
              name: file.name,
              type: file.type,
            }
          : null,
      });
    }
    if (isFile) {
      setIsFile(false);
      setFile(null);
      setHeight("570px");
    }
    setMessageInputValue("");
  };

  const handleAttackClick = () => {
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      setFile(file);
      setIsFile(true);
      setMessageInputValue(file.name);
      setHeight("530px");
    };
    input.click();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Control type="text" placeholder="Search" autoFocus />
            </Form.Group>
            <div
              style={{
                overflowY: "scroll",
                height: "300px",
              }}
            >
              {listFriendNotInGroup.map((item, index) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "0.675em 0.8em 0.675em 0.8em",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      padding: "0.675em 0.8em 0.675em 0.8em",
                    }}
                  >
                    <Avatar
                      style={{
                        marginRight: "1em",
                      }}
                      src={avatar}
                      name="Emily"
                      status="available"
                      size="md"
                    />
                    <div>{item.username}</div>
                  </div>
                  <InputGroup.Checkbox
                    aria-label="Checkbox for following text input"
                    defaultChecked={item.checked}
                    onChange={() => {
                      handleClickCheckBox(item.friendId);
                    }}
                  />
                </div>
              ))}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddUserToGroup}>
            Add to group
          </Button>
        </Modal.Footer>
      </Modal>
      {chooseId && (
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            <Avatar src={info.avatar} />
            <ConversationHeader.Content userName={info.name} />
            <ConversationHeader.Actions>
              {isGroup && (
                <BsPersonFillAdd
                  size={30}
                  color="#6ea9d7"
                  onClick={handleShow}
                />
              )}
              <VoiceCallButton
                onClick={() => {
                  handleCallButton();
                }}
              />
              <VideoCallButton />
            </ConversationHeader.Actions>
          </ConversationHeader>
          <MessageList
            style={{
              // height: "570px",
              height: height,
              overflow: "scroll",
            }}
          >
            {messages.map((element, index) => {
              if (element.creator == user.username) {
                if (
                  index == messages.length - 1 ||
                  element.creator != messages[index + 1].creator
                ) {
                  return (
                    <Message
                      model={{
                        message: element.messageBody,
                        sentTime: "15 mins ago",
                        sender: element.creator,
                        direction: "outgoing",
                        position: "single",
                      }}
                    >
                      <Message.Footer
                        sender={element.creator}
                        sentTime={dateHelper.formatTime(element.createdAt)}
                      />
                    </Message>
                  );
                } else {
                  return (
                    <Message
                      model={{
                        message: element.messageBody,
                        sentTime: "15 mins ago",
                        sender: element.creator,
                        direction: "outgoing",
                        position: "single",
                      }}
                    />
                  );
                }
              } else {
                if (
                  index == messages.length - 1 ||
                  element.creator != messages[index + 1].creator
                ) {
                  return (
                    <Message
                      model={{
                        message: element.messageBody,
                        sentTime: "15 mins ago",
                        sender: element.creator,
                        direction: "incoming",
                        position: "single",
                      }}
                    >
                      <Avatar src={element.avatar} name="Zoe" />
                      <Message.Footer
                        sender={element.creator}
                        sentTime={dateHelper.formatTime(element.createdAt)}
                      />
                    </Message>
                  );
                } else {
                  return (
                    <Message
                      model={{
                        message: element.messageBody,
                        sentTime: "15 mins ago",
                        sender: element.creator,
                        direction: "incoming",
                        position: "first",
                      }}
                      avatarSpacer
                    />
                  );
                }
              }
            })}
          </MessageList>
          {isFile && (
            <InputToolbox>
              <div>
                <span
                  style={{
                    margin: "5px",
                    padding: "5px",
                    background: "#BDE7F6",
                    borderRadius: "5px",
                  }}
                >
                  {file.name}
                </span>

                <GiCancel
                  color="red"
                  onClick={() => {
                    setIsFile(false);
                    setFile(null);
                    setHeight("570px");
                    setMessageInputValue("");
                  }}
                />
              </div>
            </InputToolbox>
          )}

          <MessageInput
            placeholder="Type message here"
            value={messageInputValue}
            activateAfterChange="true"
            onChange={(val) => {
              if (!isFile) setMessageInputValue(val);
            }}
            onSend={handleSendMessage}
            onAttachClick={handleAttackClick}
          />
        </ChatContainer>
      )}
    </>
  );
};

export default MyChatContainer;
