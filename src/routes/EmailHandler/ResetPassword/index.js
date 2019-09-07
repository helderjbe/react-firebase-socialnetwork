import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';
import { withSnackbar } from '../../../components/Snackbar';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { LinearProgress } from '@material-ui/core';

class ResetPassword extends Component {
  state = {
    email: null,
    error: null,
    password: '',
    confirmPassword: '',
    loading: false
  };

  async componentDidMount() {
    const { api, actionCode } = this.props;

    try {
      const email = await api.auth.verifyPasswordResetCode(actionCode);
      this.setState({ email });
    } catch (error) {
      this.setState({ error });
    }
  }

  onSubmit = async () => {
    const { api, actionCode, history, callSnackbar } = this.props;
    const { email, password } = this.state;

    await this.setState({ loading: true });

    try {
      await api.auth.confirmPasswordReset(actionCode, password);
      callSnackbar('Password reset successfully', 'success');
      try {
        await api.auth.signInWithEmailAndPassword(email, password);
        history.push(ROUTES.HOME);
      } catch (error) {
        history.push(ROUTES.SIGN_IN);
      }
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  render() {
    const { password, confirmPassword, loading } = this.state;

    const isInvalid = password.length < 6 || password !== confirmPassword;

    return (
      <>
        <Typography component="h1" variant="h5" align="center">
          Reset Password
        </Typography>
        <form onSubmit={this.onSubmit}>
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
      </>
    );
  }
}

ResetPassword.propTypes = {
  api: PropTypes.object.isRequired,
  actionCode: PropTypes.string.isRequired
};

export default withRouter(withFirebase(withSnackbar(ResetPassword)));
