import { socket } from './api';

let bufferSize = 2048,
  processor,
  input,
  globalStream;

const constraints = {
  audio: true,
  video: false
};

var base64ToBuffer = function (buffer) {
  var binary = window.atob(buffer);
  var buffer = new ArrayBuffer(binary.length);
  var bytes = new Uint8Array(buffer);
  for (var i = 0; i < buffer.byteLength; i++) {
      bytes[i] = binary.charCodeAt(i) & 0xFF;
  }
  return buffer;
};

function initRecording(context) {

  bufferSize = 2048;
  processor = null;
  input = null;
  globalStream = null;

  processor = context.createScriptProcessor(bufferSize, 1, 1);
  processor.connect(context.destination);
  context.resume();

  var handleSuccess = function (stream) {
    globalStream = stream;
    if (input == undefined){
      input = context.createMediaStreamSource(stream);
    }
    input.connect(processor);

    processor.onaudioprocess = function (e) {
      microphoneProcess(e);
    };
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(handleSuccess);
}

function microphoneProcess(e) {
  var left = e.inputBuffer.getChannelData(0);
  var left16 = downsampleBuffer(left, 44100, 16000);
  console.log("sending audio chunks");
  socket.emit('binaryStream', left16);
}

function startStreaming(context) {
  console.log("starting input");
  initRecording(context);
}

function stopStreaming(context) {
  console.log("stop input");
  let track = globalStream.getTracks()[0];
  track.stop();
  if(input){
    input.disconnect(processor);
    processor.disconnect();
  }
}
var downsampleBuffer = function (buffer, sampleRate, outSampleRate) {
    if (outSampleRate == sampleRate) {
        return buffer;
    }
    if (outSampleRate > sampleRate) {
        throw "downsample rate must be less than original sample rate";
    }
    var sampleRateRatio = sampleRate / outSampleRate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Int16Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }

        result[offsetResult] = Math.min(1, accum / count)*0x7FFF;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result.buffer;
}
export { base64ToBuffer, startStreaming, stopStreaming }
