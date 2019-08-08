import React from 'react';
import PropTypes from 'prop-types';

import withAuthState, { withUserSession } from './components/Session';

import { MediaQueryXsDown, MediaQuerySmUp } from './aux/mediaQueries';
import * as ROUTES from './constants/routes';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { withStyles } from '@material-ui/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import HomePage from './pages/Home';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import PasswordForgetPage from './pages/PasswordForget';
import UserSettingsPage from './pages/UserSettings';
import NewGroupPage from './pages/Groups/New';
import EditGroupPage from './pages/Groups/Edit';
import MembersGroupPage from './pages/Groups/Members';
import ApplicationsGroupPage from './pages/Groups/Applications';
import GroupDetailsPage from './pages/Groups/Details';
import GroupPage from './pages/Groups/Group';
import GroupsPage from './pages/Groups';

import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import BottomNav from './components/BottomNav';
import { Box } from '@material-ui/core';

const MainContainer = withStyles(theme => ({
  root: {
    marginTop: theme.spacing(2)
  }
}))(Container);

const App = props => {
  const { authstate } = props;

  return (
    <Router>
      <NavBar />
      <MainContainer maxWidth="md">
        <Grid container spacing={2}>
          <Grid item sm={8} xs={12}>
            <Switch>
              <Route path={ROUTES.HOME} exact component={HomePage} />
              <Route path={ROUTES.SIGN_IN} component={SignInPage} />
              <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
              <Route
                path={ROUTES.PASSWORD_FORGET}
                component={PasswordForgetPage}
              />
              <Route path={ROUTES.SETTINGS} component={UserSettingsPage} />
              <Route path={ROUTES.GROUPS} exact component={GroupsPage} />
              <Route path={ROUTES.GROUPS_NEW} component={NewGroupPage} />
              <Route path={ROUTES.GROUPS_ID} exact component={GroupPage} />
              <Route
                path={ROUTES.GROUPS_ID_APPLICATIONS}
                component={ApplicationsGroupPage}
              />
              <Route path={ROUTES.GROUPS_ID_EDIT} component={EditGroupPage} />
              <Route
                path={ROUTES.GROUPS_ID_DETAILS}
                component={GroupDetailsPage}
              />
              <Route
                path={ROUTES.GROUPS_ID_MEMBERS}
                component={MembersGroupPage}
              />
            </Switch>
          </Grid>
          <MediaQuerySmUp>
            <Grid item sm={4}>
              <SideBar />
            </Grid>
          </MediaQuerySmUp>
        </Grid>
      </MainContainer>
      <MediaQueryXsDown>
        {authstate && (
          <Box mt={9}>
            <BottomNav />
          </Box>
        )}
      </MediaQueryXsDown>
    </Router>
  );
};

App.propTypes = {
  authstate: PropTypes.object
};

export default withAuthState(withUserSession(App));
