import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import StopStartTranslation from './StopStartTranslation';
import ContinuousTranslation from './ContinuousTranslation';


const styles = theme => ({
  root: {
      flexGrow: 1,
  },
  title: {
    padding: theme.spacing.unit * 2,
     color: 'white',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(720 + theme.spacing.unit * 2 * 2)]: {
      width: 720,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    [theme.breakpoints.up(720 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
    },
  },
  form: {
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(720 + theme.spacing.unit * 3 * 2)]: {
      padding: theme.spacing.unit * 3,
    },
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit,
  },
});



class CloudAIDemos extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: 0,
      currentForm: <StopStartTranslation />
    };
  }
  handleChangeIndex = index => {
    this.setState({ value: index });
  };
  getTabContent = (event, value) => {
    let formName = '';
    switch (value) {
      case 0:
        formName = <StopStartTranslation />;
        break;
      case 1:
        formName = <ContinuousTranslation />;
        break;
      default:
        throw new Error('Unknown Tab');
        break;
    }
    this.setState({ value: value, currentForm: formName });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <React.Fragment>
        <CssBaseline />
        <main className={classes.layout}>
          <Paper className={classes.paper}>
            <AppBar position="static">
              <Typography component="h1" variant="h4" className={classes.title} align="center">
                Speech-to-Speech Translation
              </Typography>
            </AppBar>

            <React.Fragment>
              <div className={classes.form}>
                <StopStartTranslation />
              </div>
            </React.Fragment>
          </Paper>
        </main>
      </React.Fragment>
    );
  }
}

CloudAIDemos.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CloudAIDemos);
