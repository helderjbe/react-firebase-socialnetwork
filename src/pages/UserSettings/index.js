import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import UserProfile from '../../components/UserSettings/Profile';

import { withProtectedRoute } from '../../components/Session';

const UserSettingsPage = props => {
  const { authstate } = props;
  return (
    <Card>
      <CardContent>
        <Typography component="h1" variant="h5" align="center">
          My Profile
        </Typography>
        <UserProfile authstate={authstate} />
      </CardContent>
    </Card>
  );
};

UserSettingsPage.propTypes = {
  authstate: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(UserSettingsPage);
