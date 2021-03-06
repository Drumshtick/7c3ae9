export const calculateUnreadMsgCount = (convo, activeChat) => {
  /** Calculates total number of unread messages
   * sent to the user
   * convo : conversation state 
   * returns : number
   */ 
  // If active
  if (activeChat === convo.otherUser.username) {
    return 0;
  }

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

export const lastReadMsgId = (messages) => {
  /** Gets the last message sent by the client that was read by the other user
   * messages : array of messages
   * returns : id of message or null if none found
   */
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].isRead) {
      return messages[i].id;
    }
  }
  return null;
};

export const addReadStatusToMessages = (convo, activeChat) => {
  /** Loops through all messages then adds a read status to all messages sent by the user
   * convo : conversation object
   * returns : new messages array with read status added to each message
   */
  const newMessages = convo.messages.map(message => {
    if (message.senderId === convo.otherUser.id) {
      return {...message};
    }
    if (convo.otherUser.active) {
      return {...message, isRead: true}
    }
    if (Date.parse(message.createdAt) < Date.parse(convo.otherUser.lastViewed)) {
      return {...message, isRead: true}
    }
    return {...message, isRead: false}
  });
  return newMessages;
}
