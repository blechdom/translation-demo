'use strict';
const express = require('express');
const os = require('os');
const Multer = require('multer');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const speech = require('@google-cloud/speech');
var archiver = require('archiver');
const textToSpeech = require('../../texttospeech-v1beta1/src/v1beta1/index.js');
var readline = require('readline');
const app = express();
const EventEmitter = require('events');
class MessageEmitter extends EventEmitter {}
const transcriptionStatusEmitter = new MessageEmitter();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const format = require('util').format;
var util = require('util');
var fs = require('fs');

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
  //  fileSize: 500 * 1024 * 1024 // no larger than 500mb, you can change as needed.
  }
});

// A bucket is a container for objects (files).
var audioFileList = [];
var numberOfFiles = 0;
var batchCount = 0;
const bucketName = 'batch-transcribe';
const bucket = storage.bucket(bucketName);

app.use(express.static('dist'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '')));

// Process the file upload and upload to Google Cloud Storage.
app.post('/uploadHandler', multer.single('file'), (req, res, next) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }
  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname);

  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    next(err);
  });

  blobStream.on('finish', () => {
    console.log("pushed " + req.file.originalname);
    audioFileList.push(req.file.originalname);
    transcribeFromBucket(req.file.originalname);
    const publicUrl = format(`https://storage.googleapis.com/${bucketName}/${blob.name}`);
    res.status(200).send(publicUrl);

  });

  blobStream.end(req.file.buffer);
});

async function deleteAllFilesInBucket(){
  const [files] = await storage.bucket(bucketName).getFiles();

  console.log('Files:');
  files.forEach(file => {
    console.log(file.name);
    deleteFileFromBucket(file.name);
  });

}
deleteAllFilesInBucket();

async function deleteFileFromBucket(audioFileName){
  await storage
    .bucket(bucketName)
    .file(audioFileName)
    .delete();

  console.log(`gs://${bucketName}/${audioFileName} deleted.`);
}

const speechClient = new speech.SpeechClient();

let ttsClient = new textToSpeech.TextToSpeechClient();

let ttsText = '';
let voiceCode = '';
let speechLanguageCode = 'en-US';
let speechModel = 'default';
let useEnhanced = 'false';
let enableAutomaticPunctuation = "true";

const STREAMING_LIMIT = 55000;

let recognizeStream = null;
let restartTimeoutId;

io.on('connection', socket => {

  console.log("New client connected");

  transcriptionStatusEmitter.on('transcriptionStatusMessage', function(statusMessage) {
    console.log("transcription status received " + statusMessage);
    socket.emit("transcriptionStatus", statusMessage);
  });

  socket.on('tts-text', function(data){
    ttsText = data;
  });

  socket.on('voiceCode', function(data) {
    console.log("voice code: " + data);
    voiceCode = data;
  });

  socket.on('speechLanguageCode', function(data) {
    speechLanguageCode = data;
  });

  socket.on('speechModel', function(data){
    speechModel = data;
    console.log("speech model updated " + speechModel);
    if(speechModel=='automl'){
      //sttRequest.config.model = "projects/199192281405/locations/us-central1/models/STT1270896092315763741:phone_call";
      speechModel = "projects/199192281405/locations/us-central1/models/STT1270896092315763741:phone_call";
      useEnhanced = "true";
    }
    else if(speechModel=='enhanced'){
      speechModel = "phone_call";
      useEnhanced = "true";
    }
    else {
      useEnhanced = "false";
    }
  });

  socket.on('speechPunctuation', function(data){
    enableAutomaticPunctuation = data;
  });


  socket.on('speechEnhanced', function(data){
    useEnhanced = data;
  });

  socket.on("startStreaming", function(data){
    console.log("starting to stream and speakToo is " + data);
    startStreaming(data);
  });

  socket.on('binaryStream', function(data) {
    if(recognizeStream!=null) {
      recognizeStream.write(data);
    }
  });

  socket.on("stopStreaming", function(data){
    clearTimeout(restartTimeoutId);
    stopStreaming();
  });

  socket.on("getZippedArchive", function(data){
    getArchive();
  });
  socket.on('getVoiceList', function(data) {

    async function getList(){
      try {
        const [result] = await ttsClient.listVoices({});
        let voiceList = result.voices;

        voiceList.sort(function(a, b) {
          var textA = a.name.toUpperCase();
          var textB = b.name.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        let languageObject = {};
        let languageName = "";
        let languageCode = "";
        let lastVoice = "";
        let languageTypes = [];

        let formattedVoiceList = [];

        for(let i in voiceList){
          //missing last voice ?

          let voice = voiceList[i];
          languageCode = voice.languageCodes[0];
          if (languageCode!=lastVoice){
            if (languageObject.languageName!=null){

              languageObject.languageTypes = formatLanguageTypes(languageTypes);
              formattedVoiceList.push(languageObject);

              languageObject = {};
              languageTypes = [];
            }

            languageName = convertLanguageCodes(languageCode);
            languageObject.languageName = languageName;
            languageObject.languageCode = languageCode;

            languageTypes.push({voice: voice.name, gender: voice.ssmlGender, rate: voice.naturalSampleRateHertz});
            lastVoice = languageCode;
          }
          else {
            languageTypes.push({voice: voice.name, gender: voice.ssmlGender, rate: voice.naturalSampleRateHertz});
          }
          if(i==(voiceList.length-1)){
              languageObject.languageTypes = formatLanguageTypes(languageTypes);
              formattedVoiceList.push(languageObject);

              languageObject = {};
              languageTypes = [];
          }
        }
        socket.emit('voicelist', JSON.stringify(formattedVoiceList));
      }
      catch(err) {
        console.log(err);
      }
    }
    getList();
  });

  socket.on("getAudioFile", function(data){
    console.log("getting audio file");
    ttsWriteAndSendAudio();
  });

  async function getArchive(){
    console.log("archivingJSON files");
      audioFileList = [];
      numberOfFiles = 0;
      batchCount = 0;

      var output = fs.createWriteStream('transcriptionsJSON.zip');
      var archive = archiver('zip');

      output.on('close', function () {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
          const zipFile = fs.readFileSync('transcriptionsJSON.zip');
          socket.emit('zippedTranscriptions', zipFile);
          console.log("sent zipped file");

          const directory = 'transcriptions';

          fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
              if (file.endsWith('.json')){
                console.log("deleting file: " + file);
                fs.unlink(path.join(directory, file), err => {
                  if (err) throw err;
                });
              }
            }
          });
          fs.unlink('transcriptionsJSON.zip', err => {
            if (err) throw err;
          });
          console.log("deleting zipped file");
      });

      archive.on('error', function(err){
          throw err;
      });

      archive.pipe(output);

      archive.directory('transcriptions/', false);
      archive.finalize();

  }

  socket.on('disconnect', function() {
    console.log('client disconnected');

    const directory = 'audio';

    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        if (file==socket.id + '.wav'){
          console.log("deleting file: " + file);
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      }
    });
  });

  async function ttsWriteAndSendAudio(){

    ttsClient = new textToSpeech.TextToSpeechClient();

    var ttsRequest = {
      voice: {languageCode: voiceCode.substring(0,5), name: voiceCode},
      audioConfig: {audioEncoding: 'LINEAR16'},
      input: {text: ttsText}
    };

    if ((voiceCode=="en/us/tpd") || (voiceCode=="en/us/tpf")){
      console.log("tacotron2");
      ttsRequest = {
        name: voiceCode,
        inputText: ttsText,
      }
      console.log(JSON.stringify(ttsRequest, null, 4));
      try {
          const [response] = await ttsClient.synthesizeTacotron2(ttsRequest);
          const writeFile = util.promisify(fs.writeFile);
          await writeFile('audio/' + socket.id + '.wav', response.audioContent, 'binary');


          const audioFile = fs.readFileSync('audio/' + socket.id + '.wav');
          const audioBase64 = new Buffer.from(audioFile).toString('base64');
          console.log("audio file written " + socket.id + '.wav');
          socket.emit('audiodata', audioBase64);
      }
      catch(err) {
        console.log(err);
      }
    }
    else {

        const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile('audio/' + socket.id + '.wav', response.audioContent, 'binary');


        const audioFile = fs.readFileSync('audio/' + socket.id + '.wav');
        const audioBase64 = new Buffer.from(audioFile).toString('base64');
        console.log("audio file written " + socket.id + '.wav');
        socket.emit('audiodata', audioBase64);

    }

  }
    function startStreaming(speakToo) {
      var sttRequest = {
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: speechLanguageCode,
            enableAutomaticPunctuation: enableAutomaticPunctuation,
            model: speechModel,
            useEnhanced: useEnhanced
        },
        interimResults: true
      };
      console.log("speak too " + speakToo);
      console.log("startStream request " + JSON.stringify(sttRequest, null, 4));
      recognizeStream = speechClient
        .streamingRecognize(sttRequest)
        .on('error', (error) => {
          console.error;
        })
        .on('data', (data) => {

          if (data.results[0] && data.results[0].alternatives[0]){
            console.log("results " + JSON.stringify(data.results[0].alternatives[0].transcript));

            var transcriptObject = {
              transcript: data.results[0].alternatives[0].transcript,
              isfinal: data.results[0].isFinal
            };
            if(speakToo){
              socket.emit("getTranscriptSpeakToo", transcriptObject);
            }
            else{
              socket.emit("getTranscript", transcriptObject);
            }

            if((data.results[0].isFinal)&&(speakToo==true)){
              console.log("also sending audio file");
              ttsText = transcriptObject.transcript;
              ttsWriteAndSendAudio();
            }
          }
        });
        socket.emit("getTranscript",
          { isstatus: "Streaming server successfully started" }
        );

        restartTimeoutId = setTimeout(restartStreaming, STREAMING_LIMIT, speakToo);
    }
    function stopStreaming(speakToo){
      recognizeStream = null;
    }

    function restartStreaming(speakToo){
      stopStreaming(speakToo);
      startStreaming(speakToo);
    }

});
async function transcribeFromBucket(audioFileName) {
  console.log("transcribing from bucket: " + audioFileName);
  transcriptionStatusEmitter.emit('transcriptionStatusMessage', {count: 0, message: "Transcribing " + audioFileName});
  const speechConfig = {

    languageCode: speechLanguageCode,
    audioChannelCount: 2,
    enableSeparateRecognitionPerChannel: true,
    enableAutomaticPunctuation: enableAutomaticPunctuation,
    model: speechModel,
    useEnhanced: useEnhanced
  };

  const speechAudio = {
    uri:'gs://' + bucketName + '/' + audioFileName
  };
  const speechRequest = {
    config: speechConfig,
    audio: speechAudio,
  };
  try {
    const [speechResponse] = await speechClient.longRunningRecognize(speechRequest);
    const [response] = await speechResponse.promise();

    var json = JSON.stringify(speechResponse.result, null, 4);
    fs.writeFile('transcriptions/' + audioFileName + '.json', json, 'utf8', function(err) {
      if (err) throw err;
      console.log('JSON write complete');
      batchCount++;
      transcriptionStatusEmitter.emit('transcriptionStatusMessage', {count: batchCount, message: batchCount + " transcription(s) complete. Written: " + audioFileName + ".json"});
      deleteFileFromBucket(audioFileName);
    });
    console.log(response)
  }
  catch(err) {
    console.error(err);
    var json = JSON.stringify(err);
    fs.writeFile('transcriptions/_ERROR-' + audioFileName + '.json', json, 'utf8', function(err) {
      if (err) throw err;
      console.log('JSON write ERROR complete');
      batchCount++;
      transcriptionStatusEmitter.emit('transcriptionStatusMessage', {count: batchCount, message: batchCount + " transcription(s) complete. This with ERROR!"});
      deleteFileFromBucket(audioFileName);
    });
  }
  console.log('end');
}
function formatLanguageTypes(voiceObjects){

  let voiceTypes = [];
  let voiceSynths = [];

  let lastSynth = '';
  let currentSynth = '';
  let tempVoiceObject = {};

  for(let i in voiceObjects){

    currentSynth = voiceObjects[i].voice.slice(6,-2);

    if (currentSynth!=lastSynth){

      if(tempVoiceObject.voiceSynth!=null){

        tempVoiceObject.voiceTypes = voiceTypes;
        voiceSynths.push(tempVoiceObject);
        tempVoiceObject = {};
        voiceTypes = [];
      }
      tempVoiceObject.voiceSynth = currentSynth;

      lastSynth = currentSynth;
    }
    voiceTypes.push({voiceCode: voiceObjects[i].voice, voiceName: voiceObjects[i].voice.substr(voiceObjects[i].voice.length - 1) + " (" + voiceObjects[i].gender.substr(0,1).toLowerCase() + ")"});

    if(i==(voiceObjects.length-1)){

        tempVoiceObject.voiceTypes = voiceTypes;
        voiceSynths.push(tempVoiceObject);
        tempVoiceObject = {};
        voiceTypes = [];
    }
  }
  return voiceSynths;
}

function convertLanguageCodes(languageCode) {
  let languageName;
  switch (languageCode) {
    case 'da-DK':
      languageName = "Danish";
      break;
    case 'de-DE':
      languageName = "German";
      break;
    case 'en-AU':
      languageName = "English (Australia)"
      break;
    case 'en-GB':
      languageName = "English (United Kingdom)"
      break;
    case 'en-US':
      languageName = "English (United States)";
      break;
    case 'es-ES':
      languageName = "Spanish";
      break;
    case 'fr-CA':
      languageName = "French (Canada)";
      break;
    case 'fr-FR':
      languageName = "French";
      break;
    case 'it-IT':
      languageName = "Italian"
      break;
    case 'ja-JP':
      languageName = "Japanese"
      break;
    case 'ko-KR':
      languageName = "Korean";
      break;
    case 'nl-NL':
      languageName = "Dutch"
      break;
    case 'nb-NO':
      languageName = "Norwegian"
      break;
    case 'pl-PL':
      languageName = "Polish";
      break;
    case 'pt-BR':
      languageName = "Portugese (Brazil)";
      break;
    case 'pt-PT':
      languageName = "Portugese"
      break;
    case 'ru-RU':
      languageName = "Russian";
      break;
    case 'sk-SK':
      languageName = "Slovak (Slovakia)";
      break;
    case 'sv-SE':
      languageName = "Swedish";
      break;
    case 'tr-TR':
      languageName = "Turkish"
      break;
    case 'uk-UA':
      languageName = "Ukrainian (Ukraine)"
      break;
    default:
      languageName = languageCode;
  }
  return languageName;
}

if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
