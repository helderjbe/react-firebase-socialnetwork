import React, { useState } from 'react';

import { withFirebase } from '../../../components/Firebase';
import { withSnackbar } from '../../../components/Snackbar';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography, LinearProgress } from '@material-ui/core';

const UserEmail = ({ api, authstate, callSnackbar }) => {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setInitialState = () => {
    setEmail('');
    setConfirmEmail('');
    setCurrentPassword('');
    setLoading(false);
  };

  const reAuth = currentPassword => {
    const credentials = api.firebase.auth.EmailAuthProvider.credential(
      authstate.email,
      currentPassword
    );
    return authstate.reauthenticateWithCredential(credentials);
  };

  const onSubmit = async event => {
    event.preventDefault();

    setLoading(true);

    try {
      await reAuth(currentPassword);
      await authstate.updateEmail(email);
      callSnackbar('Email updated successfully', 'success');
      setInitialState();
    } catch (error) {
      setLoading(false);
      callSnackbar(error.message, 'error');
    }
  };

  const isInvalid =
    email === '' ||
    email !== confirmEmail ||
    email === authstate.email ||
    currentPassword.trim() === '' ||
    loading;

  return (
    <form onSubmit={onSubmit}>
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
        onChange={event => setCurrentPassword(event.target.value)}
        helperText="Type your current password to proceed"
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        label="New Email"
        name="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        label="Confirm Email"
        name="confirmEmail"
        value={confirmEmail}
        onChange={event => setConfirmEmail(event.target.value)}
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
};

export default withFirebase(withSnackbar(UserEmail));
