export const calculateUnreadMsgCount = (convo) => {
  /** Calculates total number of unread messages
   * sent to the user
   * convo : conversation state 
   * returns : number
   */ 
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
  let id;
  messages.forEach(message => {
    if (message.isRead) {
      id = message.id
    }
  });
  return id ? id : null;
};

export const addReadStatusToMessages = (convo) => {
  /** Loops through all messages then adds a read status to all messages sent by the user
   * convo : conversation object
   * returns : new messages array with read status added to each message
   */
  const newMessages = convo.messages.map(message => {
    if (message.senderId === convo.otherUser.id) {
      return {...message};
    }
    if (Date.parse(message.createdAt) < Date.parse(convo.otherUser.lastViewed)) {
      return {...message, isRead: true}
    }
    return {...message, isRead: false}
  });
  return newMessages;
}
