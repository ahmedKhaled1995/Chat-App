const path = require("path");
const http = require("http");
const APP_NAME = "Chat App";

const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {generateMessage, generateLocationMessage} = require("./utils/messages");
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users");

const app = express();
const server = http.createServer(app);          // we are doing this step because we need access to the server to use socket.io (note that express does this for us behind the scenes)
const io = socketio(server);

const port = process.env.PORT || 3000;

// Define path for express config
const publicStaticPathDirectory = path.join(__dirname, "../public");

//console.log(publicStaticPathDirectory);         //C:\Node js\Chat App\public

// defailt page to render when visiting our site
app.use(express.static(publicStaticPathDirectory));

io.on("connection", (socket) => {       // socket for each client, io for all clients
    socket.on("join", (urlStringQueriesObj, callback) => {
        console.log(`${urlStringQueriesObj.username} has joined the server in room ${urlStringQueriesObj.room}`);      // logging for us to see in the terminal (not the browser)
        const {error, user} = addUser({
            id: socket.id,
            username: urlStringQueriesObj.username,
            room: urlStringQueriesObj.room
        });
        if(error){
            callback(error);
            return;
        }
        socket.join(user.room);
        socket.emit("message", generateMessage(`Welcome ${user.username}`, APP_NAME));
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined`, APP_NAME))
        io.to(user.room).emit("updateSideBar", {
            room: user.room,
            roomUsers: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit("updateSideBar", {
                room: user.room,
                roomUsers: getUsersInRoom(user.room)
            });
            io.to(user.room).emit("message", generateMessage(`${user.username} has left`, APP_NAME));
        }
    });

    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter();
        if(filter.isProfane(message)){
            callback("Profanity is not allowed!");
            return;
        }
        io.to(getUser(socket.id).room).emit("message" ,generateMessage(message, getUser(socket.id).username));
        callback();
    });

    socket.on("sendLocation", (location, callback) => {
        io.to(getUser(socket.id).room).emit("locationMessage", generateLocationMessage(location, getUser(socket.id).username));
        callback();
    });

});

server.listen(port, () => {                                    // note how it's not app.listen()... becaus we are using socket.io
    console.log(`Server is up and running on port ${port}`);
})
