import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import SpeechLanguageSelect from './SpeechLanguageSelect';
import MultilineOutput from './MultilineOutput';
import ParameterOptions from './ParameterOptions';
import Button from '@material-ui/core/Button';
import SpeechModelSelect from './SpeechModelSelect';
import { socket } from './api';
import { startStreaming, stopStreaming, disconnectSource } from './AudioUtils';

class SpeechToTextForm extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        audio: false
      };

      this.toggleListen = this.toggleListen.bind(this);
    }

    componentDidMount() {
      console.log("stt mounted");
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    componentWillUnmount() {

      this.stopListening();
      console.log("stt unmounted");
      //disconnectSource(this.audioContext);
      this.audioContext.close();
    }

    async startListening(){
      if(!this.state.audio){
        this.setState({audio: true});
        startStreaming(this.audioContext, false);
        console.log("startListening");
      //  socket.emit("startStreaming", false);
      }
    }

    stopListening(){
      if(this.state.audio){
        this.setState({ audio: false});
        stopStreaming(this.audioContext, false);
        console.log("stopListening");
        //socket.emit("stopStreaming", false);
      }
    }

    toggleListen() {
      console.log("toggle listen");
      if (this.state.audio) {
        this.stopListening();
      } else {
        this.startListening();
      }
    }
    render(){
      return (
        <React.Fragment>
          <Typography variant="h6" gutterBottom style={{ padding: 8 * 3 }}>
            Speech-To-Text
          </Typography>
          <Grid container spacing={24}>
            <Grid item xs={6}>
              <SpeechLanguageSelect/>
            </Grid>
            <Grid item xs={6}>
              <SpeechModelSelect/>
            </Grid>
            <Grid item xs={12}>
              <ParameterOptions/>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={this.toggleListen}>{this.state.audio ? 'Stop Listening' : 'Start Listening'}</Button>
            </Grid>
            <Grid item xs={12}>
              <MultilineOutput socket={socket} speakToo="false" />
            </Grid>
          </Grid>
        </React.Fragment>
      );
    }
}

export default SpeechToTextForm;
