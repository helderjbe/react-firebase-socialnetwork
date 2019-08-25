import React, { Component } from 'react';

import { withFirebase } from '../../components/Firebase';
import { withRouter } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const INITIAL_STATE = {
  email: '',
  password: '',
  confirmPassword: '',
  error: null
};

class SignUp extends Component {
  state = { ...INITIAL_STATE };

  onSubmit = event => {
    event.preventDefault();

    const { email, password } = this.state;
    const { api, history } = this.props;

    api
      .doCreateUserWithEmailAndPassword(email, password)
      .then(_authUser => {
        return api.doSendEmailVerification();
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        history.push(ROUTES.SETTINGS);
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, password, confirmPassword, error } = this.state;

    const isInvalid =
      password !== confirmPassword || password === '' || email === '';

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
        <Typography color="error" variant="body2">
          {error && error.message}
        </Typography>
      </form>
    );
  }
}

export default withRouter(withFirebase(SignUp));
