import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { withUserSession } from '../Session';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

import { fade, useTheme, withStyles, styled } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Slide from '@material-ui/core/Slide';
import InputBase from '@material-ui/core/InputBase';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Search from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Notifications from '@material-ui/icons/Notifications';
import ExitToApp from '@material-ui/icons/ExitToApp';

import { IconButton } from '@material-ui/core';
import { MediaQuerySmUp } from '../../aux/mediaQueries';

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

const SearchIcon = styled('div')(({ theme }) => ({
  width: theme.spacing(7),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const SearchContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: fade(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: fade(theme.palette.common.white, 0.25)
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto'
  }
}));

const Input = withStyles(theme => ({
  root: {
    color: 'inherit'
  },
  input: {
    padding: theme.spacing(1, 1, 1, 7),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200
    }
  }
}))(InputBase);

HideOnScroll.propTypes = {
  children: PropTypes.node.isRequired
};

class NavBar extends Component {
  handleSignOut = () => {
    const { api } = this.props;

    api.doSignOut();
  };

  render() {
    const { authstate } = this.props;

    return (
      <HideOnScroll {...this.props}>
        <AppBar position="sticky">
          <Toolbar>
            <MediaQuerySmUp>
              <Typography
                component={'h1'}
                variant="h6"
                style={{ display: 'flex', flexGrow: 1 }}
              >
                Social Groups
              </Typography>
            </MediaQuerySmUp>
            <SearchContainer>
              <SearchIcon>
                <Search />
              </SearchIcon>
              <Input
                placeholder="Search Groups…"
                inputProps={{ 'aria-label': 'Search' }}
              />
            </SearchContainer>
            {authstate ? (
              <>
                <IconButton>
                  <Notifications color="secondary" />
                </IconButton>
                <IconButton
                  component={Link}
                  to={ROUTES.SIGN_IN}
                  onClick={this.handleSignOut}
                >
                  <ExitToApp color="secondary" />
                </IconButton>
              </>
            ) : (
              <IconButton component={Link} to={ROUTES.SIGN_IN}>
                <AccountCircle color="secondary" />
              </IconButton>
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

export default withFirebase(withUserSession(NavBar));
