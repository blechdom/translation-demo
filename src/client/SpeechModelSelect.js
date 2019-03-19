import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 220,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
});

class SpeechModelSelect extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    speechModel: 'default',
    name: 'hai',
    labelWidth: 0,
  };

  componentDidMount() {
    this.setState({
      labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth,
    });
  }

  handleSpeechModelChange = (event) => {
    this.setState({ speechModel: event.target.value });
    console.log("speech model selected is " + event.target.value);
    let socket = this.props.socket;
    socket.emit("speechModel", event.target.value);
  };

  render() {
    const { classes } = this.props;

    return (
        <FormControl className={classes.formControl}>
          <InputLabel ref={ref => {
            this.InputLabelRef = ref;
          }} htmlFor="speech-model">Model</InputLabel>
          <Select
            native
            value={this.state.speechModel}
            onChange={this.handleSpeechModelChange}
            inputProps={{
              name: 'speech_model',
              id: 'speech-model',
            }}
          >
            <option value='default'>Default</option>
            <option value='command_and_search'>Command and Search</option>
            <option value='phone_call'>Phone Call</option>
            <option value='enhanced'>Enhanced Phone Call</option>
            <option value='automl'>AutoML</option>
            <option value='video'>Video</option>
          </Select>
        </FormControl>
    );
  }
}

SpeechModelSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SpeechModelSelect);
