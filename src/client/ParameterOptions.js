import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { socket } from './api';


class ParameterOptions extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    punctuation: true,
  };

  handleChange = name => event => {
    console.log("changed" + [name]);
    this.setState({ [name]: event.target.checked });
    if([name]=="punctuation"){
      socket.emit("speechPunctuation", event.target.checked)
    }
  };

  render() {
    return (
      <div>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.punctuation}
              onChange={this.handleChange('punctuation')}
              value="punctuation"
              color="primary"
            />
          }
          label="Punctuation"
        />
      </div>
    );
  }
}
export default ParameterOptions;
