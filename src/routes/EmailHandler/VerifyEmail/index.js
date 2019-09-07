import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

import { withFirebase } from '../../../components/Firebase';
import { withSnackbar } from '../../../components/Snackbar';

import Typography from '@material-ui/core/Typography';

class VerifyEmail extends Component {
  state = { email: null, error: null };

  async componentDidMount() {
    const { api, actionCode, history, callSnackbar } = this.props;

    try {
      await api.auth.applyActionCode(actionCode);
      callSnackbar('E-mail verification successful');
      history.push(ROUTES.HOME);
    } catch (error) {
      this.setState({ error });
    }
  }

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

export default withRouter(withFirebase(withSnackbar(VerifyEmail)));
