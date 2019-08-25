import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

const ErrorButton = withStyles(theme => ({
  root: {
    color: 'white',
    backgroundColor: theme.palette.error.light,
    '&:hover': {
      backgroundColor: theme.palette.error.main
    }
  }
}))(Button);

class LeaveGroup extends Component {
  state = { error: null };

  handleLeave = () => {
    const { authstate, api, gid } = this.props;

    api
      .refGroupMemberById(gid, authstate.uid)
      .delete()
      .then(() => this.props.handleClose())
      .catch(error => this.setState({ error }));
  };

  render() {
    const { open, handleClose } = this.props;
    const { error } = this.state;
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Are you sure you want to leave this group?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            variant="contained"
            autoFocus
          >
            Cancel
          </Button>
          <ErrorButton onClick={this.handleLeave} variant="contained">
            Leave
          </ErrorButton>
        </DialogActions>
        <Typography color="error" variant="body2">
          {error && error.message}
        </Typography>
      </Dialog>
    );
  }
}

LeaveGroup.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  authstate: PropTypes.object,
  api: PropTypes.object.isRequired,
  gid: PropTypes.string.isRequired
};

export default LeaveGroup;
