import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { withUserSession } from '../Session';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';
import { withNotifications } from '../Notifications';
import * as ROUTES from '../../constants/routes';

import { useTheme, withStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Slide from '@material-ui/core/Slide';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import AccountCircle from '@material-ui/icons/AccountCircle';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Notifications from '@material-ui/icons/Notifications';

import { IconButton, Tooltip, Badge } from '@material-ui/core';

import { MediaQuerySmUp } from '../../aux/mediaQueries';

import NotificationPopper from './NotificationPopper';

import logo from './logo_40px.png';

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

const NotificationBadge = withStyles(theme => ({
  badge: {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: `0 0 0 2px ${theme.palette.primary.dark}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.2s infinite ease-in-out',
      border: '1px solid' + theme.palette.primary.light,
      content: '""'
    }
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0
    }
  }
}))(Badge);

const NavBar = props => {
  const { api, callSnackbar, authstate, notifications } = props;

  const [lastNotificationsRead, setLastNotificationsRead] = useState(
    localStorage.getItem('lastNotificationsRead')
  );
  const [latestNotification, setLatestNotification] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (notifications.length) {
      setLatestNotification(notifications[0]);
    }
  }, [notifications, notifications.docs]);

  const handleSignOut = async () => {
    await api.doSignOut();

    callSnackbar('You have signed out', 'warning');
  };

  const handleLastNotificationsRead = () => {
    const now = new Date().getTime();
    localStorage.setItem('lastNotificationsRead', now);
    setLastNotificationsRead(now);
  };

  const toggleAnchorEl = event => {
    setAnchorEl(prevAnchorEl => (prevAnchorEl ? null : event.currentTarget));
  };

  return (
    <>
      <HideOnScroll {...props}>
        <AppBar position="sticky">
          <Toolbar>
            <Box mr="auto">
              <Link to={ROUTES.HOME} style={{ textDecoration: 'none' }}>
                <Box display="flex" flexDirection="row" alignItems="center">
                  <img src={logo} alt="Flofus logo" />
                  <MediaQuerySmUp>
                    <Box ml={1}>
                      <Typography
                        component="h1"
                        variant="h5"
                        color="secondary"
                        style={{
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          letterSpacing: '0.1em',
                          textShadow: '4px 4px rgba(0,0,0,0.10)'
                        }}
                      >
                        F<span style={{ fontSize: '0.85em' }}>LOFUS</span>
                      </Typography>
                    </Box>
                  </MediaQuerySmUp>
                </Box>
              </Link>
            </Box>
            <Tooltip title="Account settings">
              <IconButton
                component={Link}
                to={authstate ? ROUTES.SETTINGS : ROUTES.SIGN_IN}
              >
                <AccountCircle color="secondary" />
              </IconButton>
            </Tooltip>
            {authstate && (
              <>
                <Tooltip title="Notifications">
                  <IconButton
                    onClick={event => {
                      toggleAnchorEl(event);
                      handleLastNotificationsRead();
                    }}
                  >
                    <NotificationBadge
                      variant="dot"
                      invisible={
                        !latestNotification.createdAt ||
                        latestNotification.createdAt <= lastNotificationsRead
                      }
                    >
                      <Notifications color="secondary" />
                    </NotificationBadge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Sign out">
                  <IconButton onClick={handleSignOut}>
                    <ExitToApp color="secondary" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <NotificationPopper anchorEl={anchorEl} handleClose={toggleAnchorEl} />
    </>
  );
};

NavBar.propTypes = {
  authstate: PropTypes.object
};

export default withFirebase(
  withUserSession(withNotifications(withSnackbar(NavBar)))
);
