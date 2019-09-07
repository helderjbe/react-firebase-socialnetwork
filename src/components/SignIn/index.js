import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { LinearProgress } from '@material-ui/core';

class SignIn extends Component {
  state = { email: '', password: '', loading: false };

  onSubmit = async event => {
    event.preventDefault();

    const { email, password } = this.state;
    const { api, history, callSnackbar } = this.props;

    await this.setState({ loading: true });

    try {
      await api.doSignInWithEmailAndPassword(email, password);
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
    const { email, password, loading } = this.state;

    const isInvalid = password === '' || email === '' || loading;

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
        <Button
          type="submit"
          fullWidth
          disabled={isInvalid}
          variant="contained"
          color="primary"
          style={{ marginTop: '8px' }}
        >
          Sign In
        </Button>
        {loading && <LinearProgress />}
      </form>
    );
  }
}

export default withRouter(withFirebase(withSnackbar(SignIn)));
