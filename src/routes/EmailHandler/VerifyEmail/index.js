import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';

import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';

import Typography from '@material-ui/core/Typography';

class VerifyEmail extends Component {
  state = { email: null, error: null };

  componentDidMount() {
    const { api, actionCode, history } = this.props;

    api.auth
      .applyActionCode(actionCode)
      .then(() => {
        // snackbar
        history.push(ROUTES.HOME);
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
    const { error } = this.state;

    return (
      <>{error && <Typography color="error">{error.message}</Typography>}</>
    );
  }
}

VerifyEmail.propTypes = {
  api: PropTypes.object.isRequired,
  actionCode: PropTypes.string.isRequired
};

export default withRouter(withFirebase(VerifyEmail));
