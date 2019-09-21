import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withProtectedRoute } from '../../components/Session';
import { withFirebase } from '../../components/Firebase';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

import UserProfile from '../../components/UserSettings/Profile';
import UserEmail from '../../components/UserSettings/Email';
import UserPassword from '../../components/UserSettings/Password';
import { Typography } from '@material-ui/core';

class UserSettingsPage extends Component {
  state = { editEmailPassword: false };

  async componentDidMount() {
    const { api } = this.props;

    const token = await api.doGetIdTokenResult();

    if (token.signInProvider === 'password') {
      this.setState({ editEmailPassword: true });
    }
  }
  render() {
    const { authstate } = this.props;
    const { editEmailPassword } = this.state;
    return (
      <Card>
        <CardContent>
          <Typography
            component="h1"
            variant="overline"
            align="center"
            gutterBottom
          >
            Account Settings
          </Typography>
          <UserProfile authstate={authstate} />
          {editEmailPassword && (
            <>
              <Box mt={4} mb={3}>
                <Divider variant="middle" />
              </Box>
              <UserEmail authstate={authstate} />
              <Box mt={4} mb={3}>
                <Divider variant="middle" />
              </Box>
              <UserPassword authstate={authstate} />
            </>
          )}
        </CardContent>
      </Card>
    );
  }
}

UserSettingsPage.propTypes = {
  api: PropTypes.object.isRequired,
  authstate: PropTypes.object
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(withFirebase(UserSettingsPage));
