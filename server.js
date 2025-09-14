// const express = require('express');
import express from "express";
import http from "http";
// const http = require('http');
// const { Server } = require('socket.io');
import { Server } from "socket.io";
// const { v4 }  import('uuid');
import { v4 } from "uuid";
import Room from "./roomLibs.js";
// const Room=require('./roomLibs')
// Create Express app
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
// Socket.IO logic
io.on('connection', (socket) => {
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

  socket.on('join_room',(roomId)=>{
    console.log(" OJIN ROOM --------------",roomId);
    
    if (ALL_ROOMS[roomId]) {
      ALL_ROOMS[roomId].joinPlayerTwo(socket.id)
    }
    socket.join(roomId)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  socket.on('make_move',(value)=>{
    console.log("========================",value);
    console.log(ALL_ROOMS[value.roomId]);
    
    if (ALL_ROOMS[value.roomId].checkCorrectMove(socket.id)) {
      socket.to(value.roomId).emit('next_Move', {message:value,from: socket.id});
      ALL_ROOMS[value.roomId].rotateMove(socket.id)
    }else{
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
