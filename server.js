import express from "express";
import http from "http";
import { Server } from "socket.io";
import { v4 } from "uuid";
import Room from "./roomLibs.js";
import {joinRandomHandler} from "./roomLibs.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*", // or the client URL you want to allow
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
// Serve static files from "public" folder
app.use(express.static('public'));

// Basic route (optional)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
const ALL_ROOMS={}
const onlineUsers = new Map(); // userId -> socket.id

const RANDOM_QUEUE=[]
// Socket.IO logic
io.on('connection', (socket) => {
  // onlineUsers.set(socket.id, true);
  console.log('A user connected:', socket.id);
  //   socket.join("room111")
  // socket.on('chat message', (msg) => {
  //   console.log(`Message from ${socket.id}: ${msg}`);
  //   io.emit('chat message', msg); // Broadcast to all clients
  // });
  
  socket.on('create_room',()=>{
    const id = v4();
    ALL_ROOMS[id]=new Room(id,socket.id)
    socket.join(id)
    socket.emit("room_created",id)
  })

  socket.on('join_room',({roomId,playerName})=>{
    console.log(" OJIN ROOM --------------",roomId,playerName);
    let JoinedDetails
    if (ALL_ROOMS[roomId]) {
       JoinedDetails=ALL_ROOMS[roomId].joinPlayerTwo(socket.id)
       ALL_ROOMS[roomId].setName(socket.id,playerName)
    }
    socket.join(roomId)
    socket.emit("room_joined",{oppPlayerName:JoinedDetails.oppName})
    socket.to(JoinedDetails.oppsiteId).emit("room_joined",{oppPlayerName:playerName})
  })
  socket.on('set_name_in_room',(val)=>{
    if (val.roomId) {
      ALL_ROOMS[val.roomId].setName(socket.id,val.playerName)
    }
  })

  socket.on('join_random',(val)=>{
    console.log("====================== JOIN RANDOM ===============");
    
    joinRandomHandler(RANDOM_QUEUE,val,socket.id,onlineUsers,socket,ALL_ROOMS,io)
  })

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
  socket.on('make_move',(value)=>{
    console.log("========================",value);
    console.log(ALL_ROOMS[value.roomId]);
    console.log(ALL_ROOMS);
    
    if (ALL_ROOMS[value.roomId].checkCorrectMove(socket.id)) {
      console.log("------NEXT MOVE ----");
      
      socket.to(value.roomId).emit('next_Move', {message:value,from: socket.id});
      if (!value.blnPoint) {
        ALL_ROOMS[value.roomId].rotateMove(socket.id)
      }
    }else{
      console.log("wrong movr");
      
      socket.emit('error_message', {message:"WRONG MOVE"});
    }

    })
});

// io.on('make_move',(value)=>{
// console.log("========================");
// })

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
