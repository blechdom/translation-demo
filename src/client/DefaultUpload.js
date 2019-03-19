import React from 'react';
import ReactDOM from 'react-dom';
import DropzoneComponent from 'react-dropzone-component';
var ReactDOMServer = require('react-dom/server');
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 12,
  },
}))(TableCell);

const styles = theme => ({
  row: {
    display: 'flex',
    'flex-direction': 'row',
    'align-items': 'center',
    'border-bottom': '1px solid lightgray',
    'padding': 'auto 5px',
    fontSize: 12,
    '&:last-child': {
      'border-bottom': 'none',
    },
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  name: {
    width: '40%',
  },
  progress: {
    width: '40%',
    'flex-grow': 1,
    margin: 'auto 35px',
  },
  size: {
    width:'20%',
  },
  actions: {
  },
  progressBar: {
    width: '0%',
  },

});


class DefaultUpload extends React.Component {
    constructor(props) {
        super(props);
        const { classes } = props;
        this.state = {
          fileList: []
        }
        this.djsConfig = {
            addRemoveLinks: false,
            acceptedFiles: "audio/mp3,audio/wav,audio/flac",
             previewTemplate: ReactDOMServer.renderToStaticMarkup(
              <div className={classes.row}>
                <div className={classes.name}>
                  <p class="name" data-dz-name></p>
                  <strong class="error text-danger" data-dz-errormessage></strong>
                </div>
                <div className={classes.size}><p class="size" data-dz-size></p></div>
                <div className={classes.progress}>
                  <LinearProgress variant="determinate" data-dz-uploadprogress className={classes.progressBar} />
                </div>
                <div className="dz-error-message"><span data-dz-errormessage="true"></span></div>
              </div>
            )
        };

        this.componentConfig = {
            iconFiletypes: ['.wav', '.mp3', '.flac'],
            showFiletypeIcon: false,
            postUrl: '/uploadHandler',
            dropzoneSelector: '',

        };

        this.success = file => console.log('uploaded', file);

        this.progress = (file, progress) => {
          console.log('progress', file);
          console.log('progress', progress);
        };

        this.removedfile = file => {
          console.log('removing...', file);
          //this.dropzone.removeFile(file); // this does not work
        };
        this.queuecomplete = data => {
          console.log("all uploads complete: " + data);

        };

        this.totaluploadprogress = data => {
          console.log("total upload progress " + data);
        }
        this.addFileToList = file => {
            let fileArray = [];
            fileArray = this.state.fileList;
            fileArray.push(file.name);
            this.setState({fileList: fileArray});
            console.log(this.state.fileList);
            this.props.handleAddedFiles({count: this.state.fileList.length, name: file.name});
        };
        this.dropzone = null;
    }

    render() {
        const config = this.componentConfig;
        const djsConfig = this.djsConfig;

        // For a list of all possible events (there are many), see README.md!
        const eventHandlers = {
            init: dz => this.dropzone = dz,
            drop: this.callbackArray,
            addedfile: this.addFileToList,
            success: this.success,
            removedfile: this.removedfile,
            uploadprogress: this.progress,
            queuecomplete: this.queuecomplete,
            totaluploadprogress: this.totaluploadprogress,
            processingmultiple: this.processingmultiple,

        }

        return (
          <DropzoneComponent config={config} eventHandlers={eventHandlers} djsConfig={djsConfig} />
        )
    }
}
export default withStyles(styles)(DefaultUpload);
