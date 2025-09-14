const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

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

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
    socket.join("room111")
  socket.on('chat message', (msg) => {
    console.log(`Message from ${socket.id}: ${msg}`);
    io.emit('chat message', msg); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  socket.on('make_move',(value)=>{
    console.log("========================",value);
    socket.to("room111").emit('next_Move', {message:value,from: socket.id,});

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
