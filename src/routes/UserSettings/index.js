import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { withProtectedRoute } from '../../components/Session';
import { withFirebase } from '../../components/Firebase';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

import UserProfile from './Profile';
import UserEmail from './Email';
import UserPassword from './Password';
import { Typography } from '@material-ui/core';

const UserSettingsPage = ({ api, authstate }) => {
  const [editEmailPassword, setEditEmailPassword] = useState(false);

  useEffect(() => {
    const getTokenResult = async () => {
      const token = await api.doGetIdTokenResult();

      if (token.signInProvider === 'password') {
        setEditEmailPassword(true);
      }
    };

    getTokenResult();
  }, [api]);

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
};

UserSettingsPage.propTypes = {
  api: PropTypes.object.isRequired,
  authstate: PropTypes.object
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(withFirebase(UserSettingsPage));
