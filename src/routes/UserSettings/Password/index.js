import React, { useState } from 'react';

import { withFirebase } from '../../../components/Firebase';
import { withSnackbar } from '../../../components/Snackbar';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Typography, LinearProgress } from '@material-ui/core';

const UserPassword = ({ api, authstate, callSnackbar }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setInitialState = () => {
    setCurrentPassword('');
    setPassword('');
    setConfirmPassword('');
    setLoading(false);
  };

  const reAuth = (currentPassword) => {
    const credentials = api.firebase.auth.EmailAuthProvider.credential(
      authstate.email,
      currentPassword
    );
    return authstate.reauthenticateWithCredential(credentials);
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      await reAuth(currentPassword);
      await authstate.updatePassword(password);
      callSnackbar('Password updated successfully', 'success');
      setInitialState();
    } catch (error) {
      setLoading(false);
      callSnackbar(error.message, 'error');
    }
  };
  const isInvalid =
    password === '' ||
    password !== confirmPassword ||
    currentPassword.trim() === '' ||
    password === currentPassword ||
    loading;

  return (
    <form onSubmit={onSubmit}>
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
        onChange={(event) => setCurrentPassword(event.target.value)}
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
        onChange={(event) => setPassword(event.target.value)}
      />
      <TextField
        variant="outlined"
        margin="normal"
        fullWidth
        type="password"
        label="Confirm Password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
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

export default withFirebase(withSnackbar(UserPassword));
