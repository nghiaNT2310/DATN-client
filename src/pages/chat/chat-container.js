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

const MyChatContainer = ({ socket, chooseId, isGroup, user }) => {
  const [messageInputValue, setMessageInputValue] = useState("");
  const [messages, setMessage] = useState([]);
  const [show, setShow] = useState(false);
  const [listFriendNotInGroup, setListFriendNotInGroup] = useState([]);

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
    getMessage();
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
    if (!isGroup) {
      socket.emit("send-message-to-user", {
        creator: user._id,
        recipientId: chooseId,
        messageBody: messageInputValue,
      });
    } else {
      socket.emit("send-message-to-group", {
        creator: user._id,
        cecipientGroupId: chooseId,
        messageBody: messageInputValue,
      });
    }
    setMessageInputValue("");
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
            <Avatar src={avatar} name="Zoe" />
            <ConversationHeader.Content
              userName="Zoe"
              info="Active 10 mins ago"
            />
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
              height: "570px",
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
                      <Avatar src={avatar} name="Zoe" />
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

          <MessageInput
            placeholder="Type message here"
            value={messageInputValue}
            onChange={(val) => setMessageInputValue(val)}
            onSend={handleSendMessage}
          />
        </ChatContainer>
      )}
    </>
  );
};

export default MyChatContainer;
