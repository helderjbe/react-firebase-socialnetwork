import React from 'react';
import PropTypes from 'prop-types';

import StickyBox from 'react-sticky-box';

import withAuthState, { withUserSession } from './components/Session';
import withSnackbarProvider from './components/Snackbar';

import { MediaQueryXsDown, MediaQuerySmUp } from './aux/mediaQueries';
import * as ROUTES from './constants/routes';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/styles';

import HomePage from './routes/Home';
import SignInPage from './routes/SignIn';
import SignUpPage from './routes/SignUp';
import PasswordForgetPage from './routes/PasswordForget';
import UserSettingsPage from './routes/UserSettings';
import NewGroupPage from './routes/Groups/New';
import EditGroupPage from './routes/Groups/Edit';
import MembersGroupPage from './routes/Groups/Members';
import ApplicationsGroupPage from './routes/Groups/Applications';
import GroupDetailsPage from './routes/Groups/Details';
import GroupPage from './routes/Groups/Group';
import GroupsPage from './routes/Groups';
import EmailHandlerPage from './routes/EmailHandler';
import NotFoundPage from './routes/NotFound';

import NavBar from './components/NavBar';
import SideBar from './components/SideBar';
import BottomNav from './components/BottomNav';

const MainContainer = withStyles(theme => ({
  root: {
    marginTop: theme.spacing(2)
  }
}))(Container);

const routesList = [
  { path: ROUTES.HOME, component: HomePage, exact: true },
  { path: ROUTES.SIGN_IN, component: SignInPage },
  { path: ROUTES.SIGN_UP, component: SignUpPage },
  { path: ROUTES.PASSWORD_FORGET, component: PasswordForgetPage },
  { path: ROUTES.SETTINGS, component: UserSettingsPage },
  { path: ROUTES.GROUPS, component: GroupsPage, exact: true },
  { path: ROUTES.GROUPS_NEW, component: NewGroupPage },
  { path: ROUTES.GROUPS_ID, component: GroupPage, exact: true },
  { path: ROUTES.GROUPS_ID_APPLICATIONS, component: ApplicationsGroupPage },
  { path: ROUTES.GROUPS_ID_EDIT, component: EditGroupPage },
  { path: ROUTES.GROUPS_ID_DETAILS, component: GroupDetailsPage },
  { path: ROUTES.GROUPS_ID_MEMBERS, component: MembersGroupPage },
  { path: ROUTES.EMAIL_HANDLER, component: EmailHandlerPage },
  { component: NotFoundPage }
];

const App = ({ authstate }) => (
  <Router>
    <NavBar />
    <MainContainer maxWidth={'md'}>
      <Grid container spacing={2} justify="center">
        <Grid item sm={8} xs={12}>
          <Switch>
            {routesList.map((props, index) => (
              <Route {...props} key={`Route${index}`} />
            ))}
          </Switch>
        </Grid>
        {authstate && (
          <MediaQuerySmUp>
            <Grid item sm={4}>
              <StickyBox offsetTop={72} offsetBottom={20}>
                <SideBar />
              </StickyBox>
            </Grid>
          </MediaQuerySmUp>
        )}
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

App.propTypes = {
  authstate: PropTypes.object
};

export default withAuthState(withUserSession(withSnackbarProvider(App)));
