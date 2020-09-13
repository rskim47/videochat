const express = require("express");
const app = express();

const { v4: uuidV4 } = require('uuid');
const fs = require('fs');

const port = 3000;
const httpsOptions = {
  cert: fs.readFileSync("./cert/archive/popmobile.app/fullchain4.pem"),
  key: fs.readFileSync("./cert/archive/popmobile.app/privkey4.pem"),
}

const server = require("https").Server(httpsOptions, app);
const io = require('socket.io')(server);

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