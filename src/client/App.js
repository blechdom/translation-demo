import React, { Component } from 'react';
import MicButton from './MicButton';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import CloudAIDemos from './CloudAIDemos';
import blue from '@material-ui/core/colors/blue';
import 'typeface-roboto';
import './styles/app.css';
import './styles/dropzone.css';

export default class App extends Component {
  state = { };

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <CloudAIDemos />
      </div>
    );
  }
}
