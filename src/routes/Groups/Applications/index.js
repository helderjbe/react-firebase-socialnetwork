import React from 'react';
import PropTypes from 'prop-types';

import * as ROUTES from '../../../constants/routes';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import { withRouter, Link } from 'react-router-dom';

import Applications from '../../../components/Applications';

import {
  withProtectedRoute,
  withEmailVerification,
} from '../../../components/Session';

import ArrowBack from '@material-ui/icons/ArrowBack';

const ApplicationsPage = ({
  authstate,
  match: {
    params: { gid },
  },
}) => (
  <Card elevation={2}>
    <Box display="flex" alignItems="center">
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
        Applications
      </Typography>
    </Box>
    <CardContent>
      <Applications authstate={authstate} />
    </CardContent>
  </Card>
);

ApplicationsPage.propTypes = {
  authstate: PropTypes.object.isRequired,
};

const condition = (authUser) => Boolean(authUser);

export default withProtectedRoute(condition)(
  withEmailVerification(withRouter(ApplicationsPage))
);
