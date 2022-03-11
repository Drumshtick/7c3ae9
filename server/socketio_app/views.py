async_mode = None

import os

import socketio
from online_users import online_users

basedir = os.path.dirname(os.path.realpath(__file__))
sio = socketio.Server(async_mode=async_mode, logger=False)
thread = None


@sio.event
def connect(sid, environ):
    sio.emit("my_response", {"data": "Connected", "count": 0}, room=sid)


@sio.on("go-online")
def go_online(sid, user_id):
    if user_id not in online_users:
        online_users[sid] =  user_id
    sio.emit("add-online-user", user_id, skip_sid=sid)


@sio.on("new-message")
def new_message(sid, message):
    sio.emit(
        "new-message",
        {"message": message["message"], "sender": message["sender"]},
        skip_sid=sid,
    )


@sio.on("logout")
def logout(sid, user_id):
    if sid in online_users:
        del online_users[sid]
    sio.emit("remove-offline-user", user_id, skip_sid=sid)

@sio.on("viewed-convo")
def update_last_viewed(sid, convo_data):
  sio.emit("viewed-convo", convo_data, skip_sid=sid)

@sio.on("active-convo")
def update_active_convo(sid, user_data):
  sio.emit("active-convo", user_data, skip_sid=sid)

@sio.on("disconnect")
def disconnection(sid):
  if sid in online_users:
    sio.emit("active-convo", {"userId": online_users[sid], "convoId": None}, skip_sid=sid)
    del online_users[sid]
