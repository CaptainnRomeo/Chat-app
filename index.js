const express = require("express");
const http = require("http");
const { connect } = require("http2");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const botname = "chat-cord-bot";
const app = express();
const server = http.createServer(app);
const {
  userjoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("New WS connection");

  socket.on("joinroom", ({ username, room }) => {
    const user = userjoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome message
    socket.emit("message", formatMessage(botname, "Welcome to chat-app"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Catch the client msg
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
