import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

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

GroupsPage.propTypes = {
  history: PropTypes.object.isRequired
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(
  withEmailVerification(withRouter(GroupsPage))
);
