import React, { useState, useEffect } from 'react';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import {
  withProtectedRoute,
  withEmailVerification
} from '../../components/Session';

import MyGroupsHandler from '../../components/MyGroupsHandler';

import { useTheme } from '@material-ui/styles';

const GroupsPage = ({ history }) => {
  const theme = useTheme();

  useEffect(() => {
    if (window.innerWidth >= theme.breakpoints.values.sm) {
      history.push(ROUTES.HOME);
    }
  }, [history, theme.breakpoints.values.sm]);

  if (window.innerWidth >= theme.breakpoints.values.sm) {
    return null;
  } else {
    return <MyGroupsHandler />;
  }
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(
  withEmailVerification(withRouter(GroupsPage))
);
