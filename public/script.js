const socket = io('/'); // connecting to the root path 
const videoGrid = document.getElementById('video-grid'); // video location 
const myPeer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: '443'
}) // takes all web rtc info -> converts to id,  makes it easier to connect with other

// peerjs --port 3001

const myVideo = document.createElement('video');
myVideo.muted = true; // mutes our own mic so it doesn't echo 

// Holds peers in call 
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);

  // Receiving Calls 
  myPeer.on('call', call => {
    call.answer(stream)           // answer & send our stream 
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

// Closing previous connection 
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

// Connect when new users join a room 
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream); // calling user and sending our stream (vid, audio)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => { // when others send their stream
    addVideoStream(video, userVideoStream);
  })
  call.on('close', () => {              // when the user leaves the call 
    video.remove();                     // deleted the video 
  })

  peers[userId] = call // every user id is linked to call 
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play() // play once loaded
  })
  videoGrid.append(video); // adding to current 
}