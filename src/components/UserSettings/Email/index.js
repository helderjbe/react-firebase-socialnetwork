import React, { Component } from 'react';

import { withFirebase } from '../../Firebase';
import { withSnackbar } from '../../Snackbar';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography, LinearProgress } from '@material-ui/core';

const INITIAL_STATE = {
  email: '',
  confirmEmail: '',
  currentPassword: '',
  loading: false
};

class UserEmail extends Component {
  state = { ...INITIAL_STATE };

  reAuth = currentPassword => {
    const { api, authstate } = this.props;
    const credentials = api.firebase.auth.EmailAuthProvider.credential(
      authstate.email,
      currentPassword
    );
    return authstate.reauthenticateWithCredential(credentials);
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onSubmit = async event => {
    event.preventDefault();

    const { authstate, callSnackbar } = this.props;
    const { email, currentPassword } = this.state;

    await this.setState({ loading: true });

    try {
      await this.reAuth(currentPassword);
      await authstate.updateEmail(email);
      callSnackbar('Email updated successfully', 'success');
      this.setState({ ...INITIAL_STATE });
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  render() {
    const { email, confirmEmail, currentPassword, loading } = this.state;
    const { authstate } = this.props;

    const isInvalid =
      email === '' ||
      email !== confirmEmail ||
      email === authstate.email ||
      currentPassword.trim() === '' ||
      loading;

    return (
      <form onSubmit={this.onSubmit}>
        <Typography gutterBottom variant="subtitle1" color="textSecondary">
          Change Email
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          label="Your Password"
          name="currentPassword"
          value={currentPassword}
          onChange={this.onChange}
          helperText="Type your current password to proceed"
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="New Email"
          name="email"
          value={email}
          onChange={this.onChange}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Confirm Email"
          name="confirmEmail"
          value={confirmEmail}
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
          Save
        </Button>
        {loading && <LinearProgress />}
      </form>
    );
  }
}

export default withFirebase(withSnackbar(UserEmail));
