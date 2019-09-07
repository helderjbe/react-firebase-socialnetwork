import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
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

const ConfirmAction = ({
  dialogTitle,
  open,
  handleClose,
  handleAction,
  red,
  loading,
  text
}) => (
  <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        This action can't be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={handleClose}
        variant="contained"
        disabled={loading}
        autoFocus
      >
        Cancel
      </Button>
      {red ? (
        <ErrorButton
          onClick={handleAction}
          variant="contained"
          disabled={loading}
        >
          {text}
        </ErrorButton>
      ) : (
        <Button
          onClick={handleAction}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {text}
        </Button>
      )}
    </DialogActions>
    {loading && <LinearProgress />}
  </Dialog>
);

ConfirmAction.propTypes = {
  dialogTitle: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAction: PropTypes.func.isRequired,
  red: PropTypes.bool,
  open: PropTypes.bool,
  loading: PropTypes.bool,
  text: PropTypes.string
};

export default ConfirmAction;
