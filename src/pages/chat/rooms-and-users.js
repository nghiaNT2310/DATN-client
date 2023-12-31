import {
  Avatar,
  Conversation,
  ConversationList,
  ExpansionPanel,
  Search,
  Sidebar,
} from "@chatscope/chat-ui-kit-react";
import Grid from "@mui/material/Grid";
import axios from "axios";
import React, { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import {
  AiOutlineBell,
  AiOutlineSetting,
  AiOutlineLogout,
} from "react-icons/ai";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import avatar from "../../assets/avata.svg";

const LeftSideBar = ({
  socket,
  chooseId,
  setChooseId,
  isGroup,
  setIsGroup,
  user,
}) => {
  const [lstConversation, setLstConversation] = useState([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [explore, setExplore] = useState([]);
  const navigate = useNavigate();
  const [isNotification, setIsNotification] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [groupName, setGroupName] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCreateGroup = () => {
    setShow(false);
    socket.emit("create-group", { creator: user._id, groupName: groupName });
    setGroupName("");
  };

  useEffect(() => {
    getLstConversation();
    getListNotification();
  }, []);

  useEffect(() => {
    const exploreUser = async () => {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `http://localhost:5000/explore/?find=${search}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const data = await axios.request(config);
      setExplore(data.data);
    };
    exploreUser();
  }, [search]);

  useEffect(() => {
    socket.on("notification-add-friend", (data) => {
      setNotifications((pre) => [data, ...pre]);
    });

    socket.on("notification-add-friend-cancel", (data) => {
      setNotifications((pre) => {
        return pre.filter((e) => e._id != data._id);
      });
    });

    socket.on("new-friend-conversation", (data) => {
      setLstConversation((pre) => [data, ...pre]);
    });

    socket.on("add-to-new-group", (data) => {
      setLstConversation((pre) => [data, ...pre]);
    });

    socket.on("be-added-to-new-group", (data) => {
      setLstConversation((pre) => [data, ...pre]);
    });

    socket.on("new-message-side-bar", (data) => {
      setLstConversation((pre) => [
        { ...data },
        ...pre.filter((e) => e.id != data.id || e.isGroup != data.isGroup),
      ]);
    });

    return () => {
      socket.off("notification-add-friend");
      socket.off("notification-add-friend-cancel");
      socket.off("new-friend-conversation");
      socket.off("add-to-new-group");
      socket.off("be-added-to-new-group");
      socket.off("new-message-side-bar");
    };
  }, [socket, lstConversation]);

  const getListNotification = async () => {
    try {
      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "http://localhost:5000/notification",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const data = await axios.request(config);
      setNotifications(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getLstConversation = async () => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "http://localhost:5000/message",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };
    try {
      const data = await axios.request(config);
      setLstConversation(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Sidebar position="left" scrollable={true}>
      <div
        style={{
          alignSelf: "flex-center",
          lineHeight: "40px",
          display: "flex",
          justifyContent: "space-between",
          padding: "0.675em 0.8em 0.675em 0.8em",
        }}
      >
        <div
          style={{
            alignSelf: "flex-center",
            lineHeight: "40px",
            display: "flex",
            justifyContent: "space-between",
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
          <div>{user.username}</div>
        </div>

        <div
          style={{
            alignSelf: "flex-center",
            lineHeight: "40px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <AiOutlineBell
              size="20px"
              color="gray"
              onClick={() => {
                setIsNotification(!isNotification);
              }}
            />
          </div>
          <div>
            <AiOutlineLogout
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/", { replace: true });
              }}
              size="20px"
              color="gray"
            />
          </div>
        </div>
      </div>
      {!isNotification && (
        <div>
          <Grid container>
            <Grid item xs={11}>
              <Search
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  if (e == "") setExplore([]);
                  setSearch(e);
                }}
                onClearClick={() => {
                  setSearch("");
                  setExplore([]);
                }}
              />
            </Grid>
            <Grid
              item
              xs={1}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IoIosAddCircleOutline
                size="50px"
                color="gray"
                onClick={handleShow}
              />
            </Grid>
          </Grid>
          {!search.length && (
            <ConversationList
              style={{
                height: "100vh",
              }}
              scrollable
            >
              {lstConversation.map((element) => (
                <Conversation
                  name={element.name}
                  lastSenderName={element.lastSenderName}
                  info={element.message}
                  onClick={(e) => {
                    setChooseId(element.id);
                    setIsGroup(element.isGroup);
                  }}
                >
                  <Avatar src={avatar} name="Lilly" status="available" />
                </Conversation>
              ))}
            </ConversationList>
          )}
          {search.length && (
            <ConversationList
              style={{
                height: "100vh",
              }}
              scrollable
            >
              {explore.map((element) => (
                <Conversation name={element.username} key={element.id}>
                  <Conversation.Operations visible>
                    <Button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        socket.emit("add-friend", {
                          sender: user._id,
                          receiver: element.id,
                        });
                        setExplore((pre) =>
                          pre.filter((e) => e.id != element.id)
                        );
                      }}
                    >
                      Add
                    </Button>
                  </Conversation.Operations>
                  <Avatar src={avatar} name="Lilly" status="available" />
                </Conversation>
              ))}
            </ConversationList>
          )}
        </div>
      )}
      {isNotification && (
        <div>
          {/* <div
            style={{
              display: "flex",
              justifyContent: "space-between",
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
            <div>{user.username} da chap nhan loi moi ket ban cua ban</div>
          </div> */}
          {notifications.map((e) => {
            if (e.type == 2) {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: "row",
                    padding: "0.675em 0.8em 0.675em 0.8em",
                  }}
                  key={e._id}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
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
                    <div>{e.message}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      style={{ height: "30px" }}
                      size="sm"
                      onClick={() => {
                        socket.emit("sender-cancel-add-friend", e);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div>{e.message}</div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        size="sm"
                        onClick={() => {
                          socket.emit("receiver-accept-add-friend", e);
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          socket.emit("receiver-reject-add-friend", e);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Group name</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCreateGroup}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </Sidebar>
  );
};

export default LeftSideBar;
