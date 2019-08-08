import React, { Component } from 'react';

import { withFirebase } from '../../Firebase';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';

const INITIAL_STATE = {
  currentPassword: '',
  password: '',
  confirmPassword: ''
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

  onSubmit = event => {
    event.preventDefault();

    const { authstate } = this.props;
    const { currentPassword, password } = this.state;

    this.reAuth(password)
      .then(() => authstate.updatePassword(currentPassword))
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => console.error(error.message));
  };

  render() {
    const { password, confirmPassword, currentPassword } = this.state;

    const isInvalid =
      password === '' ||
      password !== confirmPassword ||
      currentPassword.trim() === '' ||
      password === currentPassword;

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
          id="currentPassword"
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
          id="password"
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
          id="confirmPassword"
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
      </form>
    );
  }
}

export default withFirebase(UserEmail);
