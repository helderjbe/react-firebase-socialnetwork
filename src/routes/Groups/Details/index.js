import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import * as ROUTES from '../../../constants/routes';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GroupDetails from '../../../components/GroupDetails';

import {
  withProtectedRoute,
  withEmailVerification,
} from '../../../components/Session';
import { Box, IconButton, Tooltip, Typography } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';

import ArrowBack from '@material-ui/icons/ArrowBack';
import Settings from '@material-ui/icons/Settings';
import { withFirebase } from '../../../components/Firebase';

const GroupDetailsPage = ({
  authstate,
  match: {
    params: { gid },
  },
  api,
}) => {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      const token = await api.doGetIdTokenResult();

      if (token.claims.groups[gid] === 'admin') {
        setAdmin(true);
      }
    };

    getToken();
  }, [api, gid]);

  return (
    <Card elevation={2}>
      <Box display="flex">
        <Box flexGrow={1} display="flex" alignItems="center">
          <Box mr={2}>
            <Tooltip title="Back">
              <IconButton
                aria-label="back"
                component={Link}
                to={ROUTES.GROUPS_ID.replace(':gid', gid)}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography component="h1" variant="overline" align="center">
            Group Details
          </Typography>
        </Box>
        {admin && (
          <Tooltip title="Edit group settings (Admin only)">
            <IconButton
              component={Link}
              to={ROUTES.GROUPS_ID_EDIT.replace(':gid', gid)}
              color="primary"
            >
              <Settings />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CardContent>
        <GroupDetails authstate={authstate} />
      </CardContent>
    </Card>
  );
};

GroupDetailsPage.propTypes = {
  authstate: PropTypes.object.isRequired,
};

const condition = (authUser) => Boolean(authUser);

export default withProtectedRoute(condition)(
  withEmailVerification(withRouter(withFirebase(GroupDetailsPage)))
);
