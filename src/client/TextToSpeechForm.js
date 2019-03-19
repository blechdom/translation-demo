import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LanguageSelects from './LanguageSelects';
import MultilineInput from './MultilineInput';
import Button from '@material-ui/core/Button';
import fileDownload from 'js-file-download';
import { socket } from './api';
import { playAudioBuffer, base64ToBuffer, disconnectSource } from './AudioUtils';

class TextToSpeechForm extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        audioType: 'play',
        disableButton: true,
      }

      this.handlePlay = this.handlePlay.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
      this.handleFormValidation = this.handleFormValidation.bind(this);
    }

    componentDidMount() {

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      socket.on('audiodata', (data) => {

        var audioFromString = base64ToBuffer(data);

        if(this.state.audioType=="download"){
          fileDownload(audioFromString, 'text-to-speech-audio.wav');
        }
        else {
          playAudioBuffer(audioFromString, this.audioContext, false);
        }
        this.setState({ disableButton: false });
      });

    }
    componentWillUnmount() {
      socket.off("audiodata");
      //ßdisconnectSource(this.audioContext);
      this.audioContext.close();
    }
    handleFormValidation(value){
      this.setState({voiceType: value});
    }
    handlePlay = (event)=> {
      if((this.state.voiceType!=null)&&(this.state.voiceType!='')){
        console.log("playing")
        this.setState({ audioType: 'play' });
        this.setState({ disableButton: true });
        socket.emit("getAudioFile", 'play');
      }
      else {
        alert("please select a Voice Type");
      }
    };
    handleDownload = (event)=> {
      if((this.state.voiceType!=null)&&(this.state.voiceType!='')){
        this.setState({ audioType: 'download' });
        this.setState({ disableButton: true });
        socket.emit("getAudioFile", 'download');
      }
      else {
        alert("please select a Voice Type");
      }
    };
    handleMultilineInput = (text) => {
      if(text.length <= 0) {
        this.setState({
          disableButton: true
        });
      } else {
        this.setState({
          disableButton: false
        });
      }
    };
  render(){
    return (
      <React.Fragment>
        <Typography variant="h6" gutterBottom style={{ padding: 8 * 3 }}>
          Text-To-Speech
        </Typography>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <LanguageSelects socket={socket} handleFormValidation={this.handleFormValidation} speechModel="false"/>
          </Grid>
          <Grid item xs={12}>
            <MultilineInput socket={socket} onChange={this.handleMultilineInput} />
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="primary" onClick={this.handlePlay} disabled={this.state.disableButton}>Play Audio</Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" color="primary" onClick={this.handleDownload} disabled={this.state.disableButton}>Download Audio</Button>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default TextToSpeechForm;
