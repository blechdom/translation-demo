import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
});

class MultilineInput extends React.Component {

  constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
  }

  state = {
    text: '',
  };

  handleChange(event) {
    this.setState({
      text: event.target.value,
    });
    let socket = this.props.socket;
    socket.emit("tts-text", event.target.value);
    if(this.props.onChange && typeof this.props.onChange === "function") {
      this.props.onChange(event.target.value);
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <TextField
          id="text-input"
          label="Input Text"
          multiline
          rows="6"
          className={classes.textField}
          margin="normal"
          variant="outlined"
          fullWidth
          onChange={this.handleChange}
      />
      </div>
    );
  }
}

MultilineInput.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MultilineInput);
