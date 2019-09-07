import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { LinearProgress } from '@material-ui/core';

class SignUp extends Component {
  state = { email: '', password: '', confirmPassword: '', loading: false };

  onSubmit = async event => {
    event.preventDefault();

    const { email, password } = this.state;
    const { api, history, callSnackbar } = this.props;

    await this.setState({ loading: true });

    try {
      await api.doCreateUserWithEmailAndPassword(email, password);
      await api.doSendEmailVerification(email);

      callSnackbar(
        'Please validate your email by clicking the link sent to your inbox',
        'info'
      );
      history.push(ROUTES.SETTINGS);
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, confirmPassword, loading } = this.state;

    const isInvalid =
      password !== confirmPassword ||
      password === '' ||
      email === '' ||
      loading;

    return (
      <form onSubmit={this.onSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={this.onChange}
          autoFocus
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={this.onChange}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
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
          Sign Up
        </Button>
        {loading && <LinearProgress />}
      </form>
    );
  }
}

export default withRouter(withFirebase(withSnackbar(SignUp)));
