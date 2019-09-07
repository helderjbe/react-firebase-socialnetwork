import React, { Component } from 'react';

import { withFirebase } from '../../Firebase';
import { withSnackbar } from '../../Snackbar';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography, LinearProgress } from '@material-ui/core';

const INITIAL_STATE = {
  currentPassword: '',
  password: '',
  confirmPassword: '',
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
    const { currentPassword, password } = this.state;

    await this.setState({ loading: true });

    try {
      await this.reAuth(password);
      await authstate.updatePassword(currentPassword);
      callSnackbar('Password updated successfully', 'success');
      this.setState({ ...INITIAL_STATE });
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  render() {
    const { password, confirmPassword, currentPassword, loading } = this.state;

    const isInvalid =
      password === '' ||
      password !== confirmPassword ||
      currentPassword.trim() === '' ||
      password === currentPassword ||
      loading;

    return (
      <form onSubmit={this.onSubmit}>
        <Typography gutterBottom variant="subtitle1" color="textSecondary">
          Change Password
        </Typography>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          label="Current Password"
          name="currentPassword"
          value={currentPassword}
          onChange={this.onChange}
          helperText="Type your current password to proceed"
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          label="New Password"
          name="password"
          value={password}
          onChange={this.onChange}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          label="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
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
