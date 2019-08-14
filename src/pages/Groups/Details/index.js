import React from 'react';
import PropTypes from 'prop-types';

import * as ROUTES from '../../../constants/routes';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GroupDetails from '../../../components/GroupDetails';

import { withProtectedRoute } from '../../../components/Session';
import { Box, IconButton } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';

import ArrowBack from '@material-ui/icons/ArrowBack';
import Settings from '@material-ui/icons/Settings';

const GroupDetailsPage = props => {
  const {
    authstate,
    match: {
      params: { gid }
    }
  } = props;
  return (
    <>
      <Box mb={1} display="flex">
        <Box flexGrow={1}>
          <IconButton
            aria-label="back"
            component={Link}
            to={ROUTES.GROUPS_ID.replace(':gid', gid)}
          >
            <ArrowBack />
          </IconButton>
        </Box>
        <IconButton
          component={Link}
          to={ROUTES.GROUPS_ID_EDIT.replace(':gid', gid)}
          color="primary"
        >
          <Settings />
        </IconButton>
      </Box>
      <Card>
        <CardContent>
          <GroupDetails authstate={authstate} />
        </CardContent>
      </Card>
    </>
  );
};

GroupDetailsPage.propTypes = {
  authstate: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(withRouter(GroupDetailsPage));
