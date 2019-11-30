import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import * as ROUTES from '../../constants/routes';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

class Feedback extends Component {
  state = {
    message: '',
    loading: false
  };

  onSubmit = async event => {
    event.preventDefault();

    const { message } = this.state;
    const { api, authstate, history, callSnackbar } = this.props;

    this.setState({ loading: true });

    try {
      await api.refFeedback().add({
        message,
        uid: authstate.uid,
        createdAt: api.firebase.firestore.Timestamp.now().toMillis()
      });

      callSnackbar('Feedback sent. Thank you', 'success');
      history.push(ROUTES.HOME);
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { message, loading } = this.state;

    const isInvalid = message.length < 3;

    return (
      <form autoComplete="off" onSubmit={this.onSubmit}>
        <TextField
          multiline
          rows={6}
          variant="outlined"
          margin="normal"
          fullWidth
          label="Feedback details"
          name="message"
          required
          value={message}
          onChange={this.onChange}
        />
        <Button
          type="submit"
          fullWidth
          disabled={isInvalid}
          variant="contained"
          color="primary"
          style={{ marginTop: '8px' }}
        >
          Submit
        </Button>
        {loading && <LinearProgress />}
      </form>
    );
  }
}

Feedback.propTypes = {
  api: PropTypes.object.isRequired,
  authstate: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  callSnackbar: PropTypes.func.isRequired
};

export default withRouter(withFirebase(withSnackbar(Feedback)));
