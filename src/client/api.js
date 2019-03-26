import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:8080');

function getVoiceList(cb) {
  socket.emit('getVoiceList', true);
  socket.on('voicelist', function(data) {
    const voicelist = JSON.parse(data);
    cb(null, voicelist);
  });
}

export {socket, getVoiceList};
