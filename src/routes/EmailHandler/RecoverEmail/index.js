import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';
import { withSnackbar } from '../../../components/Snackbar';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { LinearProgress } from '@material-ui/core';

class RecoverEmail extends Component {
  state = { email: null, error: null, loading: false };

  async componentDidMount() {
    const { api, actionCode } = this.props;

    try {
      const info = await api.auth.checkActionCode(actionCode);
      this.setState({ email: info.data.email });

      await api.auth.applyActionCode(actionCode);
    } catch (error) {
      this.setState({ error });
    }
  }

  onSubmit = async () => {
    const { api, history, callSnackbar } = this.props;
    const { email } = this.state;

    await this.setState({ loading: true });

    try {
      await api.auth.sendPasswordResetEmail(email);
      callSnackbar('Password reset email sent', 'info');
      history.push(ROUTES.HOME);
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  render() {
    const { email, error, loading } = this.state;

    return (
      <>
        {email ? (
          <>
            <Typography component="h1" variant="h5" align="center">
              Recover Account
            </Typography>
            <Typography variant="caption">
              Got your password compromised? Reset it by clicking the button
              below
            </Typography>
            <Button
              onClick={this.onSubmit}
              fullWidth
              variant="contained"
              color="primary"
              style={{ marginTop: '8px' }}
            >
              Reset Password
            </Button>
            {loading && <LinearProgress />}
          </>
        ) : (
          <>{error && <Typography color="error">{error.message}</Typography>}</>
        )}
      </>
    );
  }
}

RecoverEmail.propTypes = {
  api: PropTypes.object.isRequired,
  actionCode: PropTypes.string.isRequired
};

export default withRouter(withFirebase(withSnackbar(RecoverEmail)));
