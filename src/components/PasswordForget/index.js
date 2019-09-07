import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';

import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

class PasswordForget extends Component {
  state = { email: '', loading: false };

  onSubmit = async event => {
    event.preventDefault();

    const { email } = this.state;
    const { api, callSnackbar, history } = this.props;

    await this.setState({ loading: true });

    try {
      await api.doSendPasswordResetEmail(email);

      callSnackbar(
        'A link to reset your password has been sent to your e-mail',
        'info'
      );
      history.push(ROUTES.SIGN_IN);
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, loading } = this.state;

    const isInvalid = email === '';

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
        />
        <Button
          type="submit"
          fullWidth
          disabled={isInvalid}
          variant="contained"
          color="primary"
          style={{ marginTop: '8px' }}
        >
          Reset Password
        </Button>
        {loading && <LinearProgress />}
      </form>
    );
  }
}

export default withRouter(withFirebase(withSnackbar(PasswordForget)));
