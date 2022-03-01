import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { SidebarContainer } from "../components/Sidebar";
import { ActiveChat } from "../components/ActiveChat";
import { SocketContext } from "../context/socket";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addSearchedUsers = (users) => {
    const currentUsers = {};

    // make table of current users so we can lookup faster
    conversations.forEach((convo) => {
      currentUsers[convo.otherUser.id] = true;
    });

    const newState = [...conversations];
    users.forEach((user) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[user.id]) {
        let fakeConvo = { otherUser: user, messages: [] };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = () => {
    setConversations((prev) => prev.filter((convo) => convo.id));
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post("/api/messages", body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit("new-message", {
      message: data.message,
      recipientId: body.recipientId,
      sender: data.sender,
    });
  };

  const postMessage = async (body) => {
    try {
      const data = await saveMessage(body);

      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewConvo = useCallback(
    (recipientId, message) => {
      const newConversations = [];
      conversations.forEach(convo => {
        if (convo.otherUser.id === recipientId) {
          newConversations.push({
            id: message.conversationId,
            otherUser: convo.otherUser,
            messages: [...convo.messages, message],
            latestMessageTextL: message.text
          });
        } else {
          newConversations.push(convo)
        }
      });
      setConversations(newConversations);
    },
    [setConversations, conversations],
  );

  const addMessageToConversation = useCallback(
    (data) => {
      // if sender isn't null, that means the message needs to be put in a brand new convo
      const { message, sender = null } = data;
      if (sender !== null) {
        const newConvo = {
          id: message.conversationId,
          otherUser: sender,
          messages: [message],
        };
        newConvo.latestMessageText = message.text;
        setConversations((prev) => [newConvo, ...prev]);
      }
      const newConversations = [];
      conversations.forEach(convo => {
        if (convo.id === message.conversationId) {
          newConversations.push({
            id: message.conversationId,
            otherUser: convo.otherUser,
            messages: [...convo.messages, message],
            latestMessageTextL: message.text
          });
        } else {
          newConversations.push(convo)
        }
      });
      setConversations(newConversations);
    },
    [setConversations, conversations],
  );

  const setLastViewedOfConvo = async (username) => {
    try {
      const currentConvo = conversations.find(convo => {
        return convo.otherUser.username === username;
      });
      const { data } = await axios.put("api/conversations", {
        otherUser: currentConvo.otherUser
      });
      const newConversations = [];
      conversations.forEach(convo => {
        if (convo.id === currentConvo.id) {
          newConversations.push({
            ...convo,
            lastViewed: data.lastViewed,
            messages: [...convo.messages],
            otherUser: {...convo.otherUser},
            unreadMsgCount: 0
          });
        } else {
          newConversations.push(convo);
        }
      });
      setConversations(newConversations);
    } catch(error) {
      console.error(error)
    }
  }

  const calculateUnreadMsgCount = (convo) => {
    const { lastViewed, otherUser } = convo;
    if (!lastViewed) {
      return convo.messages.length;
    }
    let unreadMsgCount = 0;
    convo.messages.forEach(msg => {
      if (
        msg.senderId ===  otherUser.id &&
        Date.parse(msg.createdAt) > Date.parse(lastViewed)
        ) {
        unreadMsgCount++;
      }
    });
    return unreadMsgCount;
  };

  const setActiveChat = (username) => {
    setLastViewedOfConvo(username);
    setActiveConversation(username);
  };

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
          return convoCopy;
        } else {
          return convo;
        }
      }),
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
          return convoCopy;
        } else {
          return convo;
        }
      }),
    );
  }, []);

  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on("add-online-user", addOnlineUser);
    socket.on("remove-offline-user", removeOfflineUser);
    socket.on("new-message", addMessageToConversation);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off("add-online-user", addOnlineUser);
      socket.off("remove-offline-user", removeOfflineUser);
      socket.off("new-message", addMessageToConversation);
    };
  }, [addMessageToConversation, addOnlineUser, removeOfflineUser, socket]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push("/login");
      else history.push("/register");
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get("/api/conversations");
        data.forEach(convo => {
          convo.unreadMsgCount = calculateUnreadMsgCount(convo);
          convo.messages.sort((a, b) => {
            return Date.parse(a.createdAt) - Date.parse(b.createdAt);
          });
        });
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
        />
      </Grid>
    </>
  );
};

export default Home;
