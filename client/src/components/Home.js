import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { SidebarContainer } from "../components/Sidebar";
import { ActiveChat } from "../components/ActiveChat";
import { SocketContext } from "../context/socket";

import {
  calculateUnreadMsgCount,
  lastReadMsgId,
  addReadStatusToMessages
} from "./utils/readStatusHelpers";

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
  const [convoHistory, setConvoHistory] = useState([null]);

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

  const sendNoActive = useCallback(() => {
    // If user has no active chat
    socket.emit("active-convo", {
      userId: user.id,
      convoId: null
    });
  }, [socket, user]);


  const postMessage = async (body) => {
    try {
      const data = await saveMessage(body);

      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message, data.lastViewed);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewConvo = useCallback(
    (recipientId, message, lastViewed) => {
      message.isRead = false;
      const newConversations = conversations.map(convo => {
        if (convo.otherUser.id === recipientId) {
          const newConvo = {
            id: message.conversationId,
            otherUser: convo.otherUser,
            messages: [...convo.messages, message],
            latestMessageText: message.text,
            lastViewed,
            lastMessageRead : lastReadMsgId([...convo.messages, message])
          }
          newConvo.messages = addReadStatusToMessages(newConvo);
          return newConvo;
        } else {
          const newConvo = {...convo};
          newConvo.messages = addReadStatusToMessages(convo);
          newConvo.lastMessageRead = lastReadMsgId(convo.messages);
          return newConvo;
        }
      });
      setConversations(newConversations);
    },
    [setConversations, conversations],
  );

  const addMessageToConversation = useCallback(
    (data) => {
      // if sender isn't null, that means the message needs to be put in a brand new convo
      const { message, sender = null, senderLastViewed } = data;
      if (sender !== null) {
        const newConvo = {
          lastViewed: null,
          id: message.conversationId,
          otherUser: {...sender, lastViewed: senderLastViewed},
          messages: [message],
          unreadMsgCount: 1,
          latestMessageText: message.text,
          latestMessageIsRead: false
        };
        setConversations((prev) => [newConvo, ...prev]);
      }
        const newConversations = conversations.map(convo => {
          if (convo.id === message.conversationId) {
            let newUnreadCount = convo.unreadMsgCount;
            if (message.senderId === convo.otherUser.id) {
              newUnreadCount++;
            }
            if (activeConversation === convo.otherUser.username) {
              newUnreadCount = 0;
              axios.put("api/conversations", {
                otherUser: convo.otherUser
              });
            }
            const updatedConvo = {
              ...convo,
              messages: [...convo.messages, message],
              latestMessageText: message.text,
              unreadMsgCount: newUnreadCount,
            };
            updatedConvo.messages = addReadStatusToMessages(updatedConvo, activeConversation);
            updatedConvo.lastMessageRead = lastReadMsgId(updatedConvo.messages);
            return updatedConvo;
          } else {
            return convo;
          }
        });
        setConversations(newConversations);
    },
    [setConversations, conversations, activeConversation],
  );


  const addLastViewedToConvo = async (username) => {
    try {
      const currentConvo = conversations.find(convo => {
        return convo.otherUser.username === username;
      });
      const { data } = await axios.put("api/conversations", {
        otherUser: currentConvo.otherUser
      });
      const newConversations = conversations.map(convo => {
        if (convo.id === currentConvo.id) {
          const updatedConvo = {
            ...convo,
            lastViewed: data.lastViewed,
            messages: [...convo.messages],
            otherUser: {...convo.otherUser},
            unreadMsgCount: 0,
            lastMessageRead : lastReadMsgId(convo.messages)
          };
          socket.emit("viewed-convo", {
            lastViewed: data.lastViewed,
            convoId: convo.id,
            otherUserId: convo.otherUser.id
          })
          return updatedConvo;
        } else {
          const newConvo = {
            ...convo,
            lastMessageRead : lastReadMsgId(convo.messages)
          };
          return newConvo;
        }
      });
      setConversations(newConversations);
    } catch(error) {
      console.error(error)
    }
  }

  const setActiveChat = (username) => {
      setConvoHistory(prev => {
        // Add activeChat to active history stack
        const activeConvo = conversations.find(convo => {
          return convo.otherUser.username === username;
        });
        const convoId = activeConvo ? activeConvo.id : null
        return [...prev, convoId]
      });
      addLastViewedToConvo(username);
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

    
    useEffect(() => {
      // If stack shows a change between active conversations update active-convo with socket
      if (
        convoHistory.length > 1 &&
        convoHistory[convoHistory.length - 1] !==
        convoHistory[convoHistory.length - 2]
        ) {
        setConvoHistory(prev => {
          const history = [...prev];
          history.shift();
          socket.emit("active-convo", {
            userId: user.id,
            convoId: history[history.length - 1]
          });
          const convo = conversations.find(convo => {
            return convo.id === history[0];
          });
          if (convo.messages.length > 1) axios.put("api/conversations", {
            otherUser: convo.otherUser
          });
          return history
        });
      }    
  }, [ convoHistory, user, socket, conversations ])

  const updateActiveConversation = useCallback(userData => {
    if (!userData.convoId) {
      return;
    }

    const convoToUpdate = conversations.find(convo => {
      return convo.otherUser.id === userData.userId;
    });

    if (!convoToUpdate) {
      return;
    }
    const newConversations = conversations.map(convo => {
      if (convo.id === userData.convoId) {
        const newConvo = {
          ...convo,
          otherUser: {...convo.otherUser, active: true}
        };
        return newConvo;
      }
      return {
        ...convo,
        otherUser: {
          ...convo.otherUser,
          active: false
        }
      };
    });

    setConversations(newConversations);
  }, [ conversations ]);
  
  const updateLastViewed = useCallback((data) => {
    const convoToUpdate = conversations.find(convo => {
      return convo.id === data.convoId;
    });
    if (!convoToUpdate) {
      return;
    }
    const newMessages = addReadStatusToMessages({
      ...convoToUpdate,
      otherUser: {
        ...convoToUpdate.otherUser,
        lastViewed: data.lastViewed
      }
    });
    const newConvo = {
      ...convoToUpdate,
      messages: newMessages,
      lastMessageRead : lastReadMsgId(newMessages),
      otherUser: {...convoToUpdate.otherUser, lastViewed: data.lastViewed}
    };
    const newConversations = [];
    conversations.forEach(convo => {
      if (convo.id === convoToUpdate.id) {
        newConversations.push(newConvo);
      } else {
        const newConvo = {
          ...convo,
        }
        const newMessages = addReadStatusToMessages(newConvo);
        newConvo.messages = newMessages;
        newConvo.lastMessageRead = lastReadMsgId(newMessages)
        newConversations.push(newConvo);
      }
    });
    setConversations(newConversations);
  }, [conversations, setConversations]);
  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on("add-online-user", addOnlineUser);
    socket.on("remove-offline-user", removeOfflineUser);
    socket.on("new-message", addMessageToConversation);
    socket.on("viewed-convo", updateLastViewed);
    socket.on("active-convo", updateActiveConversation);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off("add-online-user", addOnlineUser);
      socket.off("remove-offline-user", removeOfflineUser);
      socket.off("new-message", addMessageToConversation);
      socket.off("viewed-convo", updateLastViewed);
      socket.off("active-convo", updateActiveConversation);
  };
  }, [
    addMessageToConversation,
    addOnlineUser,
    removeOfflineUser,
    socket, updateLastViewed,
    updateActiveConversation
  ]);

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
          convo.unreadMsgCount = calculateUnreadMsgCount(convo, null);
          convo.messages.sort((a, b) => {
            return Date.parse(a.createdAt) - Date.parse(b.createdAt);
          });
          convo.messages = addReadStatusToMessages(convo);
          convo.lastMessageRead = lastReadMsgId(convo.messages);
        });
        sendNoActive();
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user, sendNoActive]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
      sendNoActive();
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
