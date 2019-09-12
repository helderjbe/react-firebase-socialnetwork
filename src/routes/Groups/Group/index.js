import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import Group from '../../../components/Group';

import {
  withProtectedRoute,
  withEmailVerification
} from '../../../components/Session';
import { styled } from '@material-ui/styles';

const FullScreenCard = styled(Card)(({ theme }) => ({
  minHeight: 320,
  maxHeight: 800,
  display: 'flex',
  flexDirection: 'column',
  height: `calc(100vh - ${theme.spacing(18)}px)`,
  [theme.breakpoints.up('sm')]: {
    height: `calc(100vh - ${theme.spacing(12)}px)`
  }
}));

const GroupPage = ({ authstate }) => (
  <FullScreenCard>
    <Group authstate={authstate} />
  </FullScreenCard>
);

GroupPage.propTypes = {
  authstate: PropTypes.object.isRequired
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(withEmailVerification(GroupPage));
