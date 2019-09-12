import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { withUserSession } from '../Session';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';
import * as ROUTES from '../../constants/routes';

import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp';

import { IconButton } from '@material-ui/core';

const HideOnScroll = props => {
  const { children } = props;

  const trigger = useScrollTrigger();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  return matches ? (
    children
  ) : (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

HideOnScroll.propTypes = {
  children: PropTypes.node.isRequired
};

class NavBar extends Component {
  handleSignOut = async () => {
    const { api, callSnackbar } = this.props;

    await api.doSignOut();

    callSnackbar('You have signed out', 'warning');
  };

  render() {
    const { authstate } = this.props;

    return (
      <HideOnScroll {...this.props}>
        <AppBar position="sticky">
          <Toolbar>
            <Box mr="auto">
              <Link to={ROUTES.HOME} style={{ textDecoration: 'none' }}>
                <Typography component="h1" variant="h6" color="secondary">
                  Social Groups
                </Typography>
              </Link>
            </Box>
            <IconButton
              component={Link}
              to={authstate ? ROUTES.SETTINGS : ROUTES.SIGN_IN}
            >
              <AccountCircle color="secondary" />
            </IconButton>
            {authstate && (
              <>
                <IconButton
                  component={Link}
                  to={ROUTES.SIGN_IN}
                  onClick={this.handleSignOut}
                >
                  <ExitToApp color="secondary" />
                </IconButton>
              </>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    );
  }
}

NavBar.propTypes = {
  authstate: PropTypes.object
};

export default withFirebase(withUserSession(withSnackbar(NavBar)));
