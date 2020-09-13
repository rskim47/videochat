const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Redireting to random page at home 
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
  console.log("New user in server");
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// Socket Functions 
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);          // Joining room
    socket.to(roomId).broadcast.emit('user-connected', userId); // to everyone else

    // Closing tab when user leaves the chat 
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    })
  })
});

server.listen(port);
console.log(`server running on port: ${port}`);