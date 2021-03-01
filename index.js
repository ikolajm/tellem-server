// Init
require("dotenv").config();

const app = require("express")();

// SOCKET.IO
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
      },
});
io.on('connection', (socket) => {
    // Join Room
    // console.log(socket)
    const { roomId } = socket.handshake.query;
    socket.join(roomId);
    console.log('a user connected');

    // New message
    socket.on("NEW_MESSAGE", (data) => {
        console.log("new message")
        io.in(roomId).emit("NEW_MESSAGE", data);
    });

    // Edit
    socket.on("EDIT_MESSAGE", (data) => {
        console.log("message edited")
        // io.in(roomId).emit("EDIT_MESSAGE", data);
    });

    // Delete
    socket.on("DELETE_MESSAGE", (data) => {
        console.log("message deleted")
        // io.in(roomId).emit("DELETE_MESSAGE", data);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("user disconnected")
        socket.leave(roomId);
    });
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const sequelize =  require('./db').sequelize;
sequelize.sync();

app.use(require("./middleware/headers"));

// Controllers
const UserAuth = require("./controllers/user/userAuth");
const UserProtected = require("./controllers/user/userProtected");
const History = require("./controllers/history/history");
const Friend = require("./controllers/friends/friends");
const Conversation = require("./controllers/conversation/conversation");
const Message = require("./controllers/message/message");
// - OPEN
app.use("/user", UserAuth);
// - CLOSED
app.use(require("./middleware/validate-session"));
app.use("/history", History);
app.use("/friends", Friend);
app.use("/user", UserProtected);
app.use("/conversation", Conversation);
app.use("/message", Message);

// Seed if needed
const userExecute = require("./helpers/seed/execute");
const data = require("./helpers/seed/data").users;
// userExecute(data);

const port = process.env.PORT;
http.listen(port, () => console.log(`Server is live on port ${port}`));