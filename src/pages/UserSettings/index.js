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

class UserSettingsPage extends Component {
  state = { editEmailPassword: false };
  componentDidMount() {
    const { api } = this.props;

    api
      .doGetIdTokenResult()
      .then(
        token =>
          token.signInProvider === 'password' &&
          this.setState({ editEmailPassword: true })
      );
  }
  render() {
    const { authstate } = this.props;
    const { editEmailPassword } = this.state;
    return (
      <Card>
        <CardContent>
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
  authstate: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(withFirebase(UserSettingsPage));
