import React from 'react';
import DefaultUpload from './DefaultUpload';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import SpeechLanguageSelect from './SpeechLanguageSelect';
import MultilineOutput from './MultilineOutput';
import ParameterOptions from './ParameterOptions';
import Button from '@material-ui/core/Button';
import SpeechModelSelect from './SpeechModelSelect';
import fileDownload from 'js-file-download';
import { socket } from './api';

class BatchTranscriptionForm extends React.Component {
    constructor(props) {
      super(props);

      this.displayData = [];

      this.state = {
        audioFolder: '',
        transcribing: false,
        hasUploaded: false,
        transcriptionStatus: '',
        logMessage: '',
        fileCount: 0,
        completedCount: 0,
        
      };

      this.handleAddedFiles = this.handleAddedFiles.bind(this);
      this.appendLog = this.appendLog.bind(this);
    }

    componentDidMount() {
      console.log("batch mounted");
      socket.on("transcriptionStatus", (data) => {
        this.setState({logMessage: data.message, completedCount: data.count});
        this.appendLog();
        if(this.state.fileCount<=data.count){
          this.setState({logMessage: data.count + " transcription(s) Complete, generating .zip file", completedCount: 0, fileCount: 0});
          this.appendLog();
          socket.emit("getZippedArchive", true);
        }
      });
      socket.on("zippedTranscriptions", (data) => {
        console.log("receiving transcriptions");
        fileDownload(data, 'transcriptionsJSON.zip');
        this.setState({transcribing: false, logMessage: 'Downloading Transcription(s) (.zip)'});
        this.appendLog();
      });
    }
    componentWillUnmount() {
      console.log("batch unmounted");
    }
    appendLog() {
       this.displayData.unshift(<div id="display-data"><pre>{this.state.logMessage}</pre></div>);
       this.setState({
          transcriptionStatus : this.displayData,
          logMessage : ""
       });
    }

    handleAddedFiles(message){
      this.setState({fileCount: message.count, logMessage: 'Uploading ' + message.count + ' files... (' + message.name + ')'});

      this.displayData.unshift(<div id="display-data"><pre>{this.state.logMessage}</pre></div>);
      this.setState({
         transcriptionStatus : this.displayData,
         logMessage : ""
      });
      this.appendLog();
    }
    render(){
      return (
        <React.Fragment>
          <Typography variant="h6" gutterBottom style={{ padding: 8 * 3 }}>
            Batch Transcription
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
              <div id="dropzone-div">
                <DefaultUpload handleAddedFiles={this.handleAddedFiles} />
              </div>
            </Grid>
            <Grid item xs={12}>
              <div id="status">{this.state.transcriptionStatus}</div>
            </Grid>
          </Grid>
        </React.Fragment>
      );
    }
}

export default BatchTranscriptionForm;
