import openSocket from 'socket.io-client';
const socket = openSocket();

function getVoiceList(cb) {
  socket.emit('getVoiceList', true);
  socket.on('voicelist', function(data) {
    let voicelist = JSON.parse(data);
    cb(null, voicelist);
  });
}

export { socket, getVoiceList};
