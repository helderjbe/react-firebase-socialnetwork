import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';

import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

class ResetPassword extends Component {
  state = { email: null, error: null, password: '', confirmPassword: '' };

  componentDidMount() {
    const { api, actionCode } = this.props;

    api.auth
      .verifyPasswordResetCode(actionCode)
      .then(email => this.setState({ email }))
      .catch(error => this.setState({ error }));
  }

  onSubmit = () => {
    const { api, actionCode, history } = this.props;
    const { email, password } = this.state;

    api.auth
      .confirmPasswordReset(actionCode, password)
      .then(() => {
        api.auth
          .signInWithEmailAndPassword(email, password)
          .then(() => history.push(ROUTES.HOME))
          .catch(() => history.push(ROUTES.SIGN_IN));
      })
      .catch(error => this.setState({ error }));
  };

  render() {
    const { password, confirmPassword } = this.state;

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
        </form>
      </>
    );
  }
}

ResetPassword.propTypes = {
  api: PropTypes.object.isRequired,
  actionCode: PropTypes.string.isRequired
};

export default withRouter(withFirebase(ResetPassword));
