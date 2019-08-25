import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';

import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

class RecoverEmail extends Component {
  state = { email: null, error: null };

  componentDidMount() {
    const { api, actionCode } = this.props;

    api.auth
      .checkActionCode(actionCode)
      .then(info => {
        this.setState({ email: info.data.email });
        return api.auth.applyActionCode(actionCode);
      })
      .catch(error => this.setState({ error }));
  }

  onSubmit = () => {
    const { api, history } = this.props;
    const { email } = this.state;

    api.auth
      .sendPasswordResetEmail(email)
      .then(() => history.push(ROUTES.HOME))
      .catch(error => this.setState({ error }));
  };

  render() {
    const { email, error } = this.state;

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

export default withRouter(withFirebase(RecoverEmail));
