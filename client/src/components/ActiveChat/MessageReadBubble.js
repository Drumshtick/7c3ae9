import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Avatar } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    display: "flex",
    justifyContent: "end",
    alignItems: "center"
  },
  avatar: {
    height: 15,
    width: 15,
    marginRight: 0,
    marginTop: 6,
  }
}));

const MessageReadBubble = ({ otherUser, lastMessage }) => {
  const classes = useStyles();
  
  return (
  <Box className={classes.root}>
    <Avatar
      alt={otherUser.username}
      src={otherUser.photoUrl}
      className={classes.avatar}
    />
  </Box>
  );
};

export default MessageReadBubble;
