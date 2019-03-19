import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  isFinal: {
    color: 'red',
  },
  pendingText: {
    color: '#b7e1cd',
  },
});

class MultilineOutput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      multiline: 'Controlled',
      outputText: '',
      newText: '',
      concatText: '',
      isFinal: false,
    };
  }

  componentDidMount() {
    const { classes } = this.props;
    console.log("stt text mounted, speak too is " + this.props.speakToo);
    let socket = this.props.socket;
    if(this.props.speakToo=="true"){
      socket.on('getTranscriptSpeakToo', (response) => {
        console.log(JSON.stringify(response));
        this.setState({newText: response.transcript});
        if (this.state.newText != undefined){
          this.setState({outputText: <div>{this.state.concatText} <div className={classes.pendingText}>{this.state.newText}</div></div>});
          if (response.isfinal){
            this.setState({
              isFinal: true,
              concatText: <div>{this.state.concatText} {this.state.newText}</div>,
            }, () => {
              this.setState({outputText: <div>{this.state.concatText}</div>});
            });
          }
        }
        this.setState({newText: ''});
        this.setState({isFinal: false});
      });
    }
    else {
      socket.on('getTranscript', (response) => {
        console.log(JSON.stringify(response));
        this.setState({newText: response.transcript});
        if (this.state.newText != undefined){
          this.setState({outputText: <div>{this.state.concatText} <div className={classes.pendingText}>{this.state.newText}</div></div>});
          if (response.isfinal){
            this.setState({
              isFinal: true,
              concatText: <div>{this.state.concatText} {this.state.newText}</div>,
            }, () => {
              this.setState({outputText: <div>{this.state.concatText}</div>});
            });
          }
        }
        this.setState({newText: ''});
        this.setState({isFinal: false});
      });
    }

  }

  componentWillUnmount(){
    console.log("stt text unmounted");
    let socket = this.props.socket;
    socket.off("getTranscript");
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
      <Typography component="h1" variant="h5">
      {this.state.outputText}
      </Typography>
      </div>
    );
  }
}

MultilineOutput.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MultilineOutput);
