import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LanguageSelects from './LanguageSelects';
import ParameterOptions from './ParameterOptions';
import MultilineOutput from './MultilineOutput';
import Button from '@material-ui/core/Button';
import { socket } from './api';
import { startStreaming, stopStreaming, playAudioBuffer, base64ToBuffer, disconnectSource } from './AudioUtils';

class SpeechTextSpeech extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      audio: false
    };
    this.toggleListen = this.toggleListen.bind(this);
    this.handleFormValidation = this.handleFormValidation.bind(this);
  }

  componentDidMount() {
    //console.log("sts mounted");
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    socket.on('audiodata', (data) => {
      var audioFromString = base64ToBuffer(data);
      this.stopListening();
      playAudioBuffer(audioFromString, this.audioContext, false);

    });
  }
  componentWillUnmount() {
    this.stopListening();
    this.audioContext.close();
    socket.off("audiodata");
  }

  async startListening(){
    if(!this.state.audio){
      startStreaming(this.audioContext, false);
      this.setState({audio: true});
      console.log("startListening");
    }
  }
  stopListening(){
    if(this.state.audio){
      this.setState({audio:false});
      stopStreaming(this.audioContext, false);
      console.log("stopListening");
    }
  }
  toggleListen() {
    if((this.state.voiceType!=null)&&(this.state.voiceType!='')){
      if (this.state.audio) {
        this.stopListening();
      } else {
        this.startListening();
      }
    }
    else {
      alert("please select a Voice Type");
    }
  }
  handleFormValidation(value){
    this.setState({voiceType: value});
  }
  render(){
    return (
      <React.Fragment>
        <Typography variant="h6" gutterBottom style={{ padding: 8 * 3 }}>
          Stop/Start Translation
        </Typography>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              <LanguageSelects socket={socket} handleFormValidation={this.handleFormValidation} speechModel="true"/>
            </Grid>
            <Grid item xs={12}>
              <ParameterOptions/>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={this.toggleListen}>{this.state.audio ? 'Stop Listening' : 'Start Listening'}</Button>
            </Grid>
            <Grid item xs={12}>
              <MultilineOutput socket={socket} speakToo="true" />
            </Grid>
          </Grid>
      </React.Fragment>
    );
  }
}

export default SpeechTextSpeech;
