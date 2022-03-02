import React from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble, MessageReadBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
  const {
    messages,
    otherUser,
    userId,
    msgReadStatus
  } = props;
  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          <SenderBubble key={message.id} text={message.text} time={time} />
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
      {
        msgReadStatus &&
        messages[messages.length - 1].senderId === userId && (
          <MessageReadBubble otherUser={otherUser} />
      )}
    </Box>
  );
};

export default Messages;
