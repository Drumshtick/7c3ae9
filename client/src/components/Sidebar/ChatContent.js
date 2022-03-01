import React from "react";
import { Box, Typography, Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  unreadMsgContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12px"
  },
  unreadMsg: {
    fontSize: 12,
    backgroundColor: "#3F92FF",
    color: "#fff",
    transform: 'scale(0.7)'
  }
}));

const ChatContent = ({ conversation, unreadMsgCount }) => {
  const classes = useStyles();

  const { otherUser } = conversation;
  const latestMessageText = conversation.id && conversation.latestMessageText;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
      <Box className={classes.unreadMsgContainer}>
        {
          unreadMsgCount > 0 && (
            <Chip
              label={unreadMsgCount}
              size="small"
              className={classes.unreadMsg}
            />
          )
        }
      </Box>
    </Box>
  );
};

export default ChatContent;
