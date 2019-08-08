import React, { Component } from 'react';

import { withFirebase } from '../../Firebase';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';

const INITIAL_STATE = { email: '', confirmEmail: '', currentPassword: '' };

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
    const { email, currentPassword } = this.state;

    this.reAuth(currentPassword)
      .then(() => authstate.updateEmail(email))
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => console.error(error.message));
  };

  render() {
    const { email, confirmEmail, currentPassword } = this.state;
    const { authstate } = this.props;

    const isInvalid =
      email === '' ||
      email !== confirmEmail ||
      email === authstate.email ||
      currentPassword.trim() === '';

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
          id="currentPassword"
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
          id="email"
          label="New Email"
          name="email"
          value={email}
          onChange={this.onChange}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="confirmEmail"
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
      </form>
    );
  }
}

export default withFirebase(UserEmail);
