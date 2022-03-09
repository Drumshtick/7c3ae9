import React from "react";
import { Box, Typography, Badge } from "@material-ui/core";
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
  previewTextBold: {
    fontSize: 12,
    color: "#333",
    letterSpacing: -0.17,
    fontWeight: "700"
  },
  unreadMsgContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12px"
  },
  unreadMsg : {
    position: 'relative',
    right: '1.25em'
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
        <Typography
          className={
            unreadMsgCount > 0 ?
            classes.previewTextBold :
            classes.previewText
            }
        >
          {latestMessageText}
        </Typography>
      </Box>
      <Box className={classes.unreadMsgContainer}>
        {
          unreadMsgCount > 0 && (
            <Badge
              color="primary"
              badgeContent={unreadMsgCount}
              className={classes.unreadMsg}
            />
          )
        }
      </Box>
    </Box>
  );
};

export default ChatContent;
