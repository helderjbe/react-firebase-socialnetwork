import React, { Component } from 'react';

import { Link, withRouter } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Home from '@material-ui/icons/Home';
import Group from '@material-ui/icons/Group';
import AccountBox from '@material-ui/icons/AccountBox';
import withStyles from '@material-ui/styles/withStyles';

const Nav = withStyles(theme => ({
  root: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    background: theme.palette.secondary.dark,
    zIndex: theme.zIndex.appBar
  }
}))(BottomNavigation);

const NavAction = withStyles(theme => ({
  wrapper: { color: theme.palette.text.primary }
}))(BottomNavigationAction);

class BottomNav extends Component {
  constructor(props) {
    super(props);

    this.state = { menuValue: `/${props.location.pathname.split('/')[1]}` };
  }

  handleChange = (_event, newValue) => {
    this.setState({ menuValue: newValue });
  };

  render() {
    const { menuValue } = this.state;

    return (
      <Nav value={menuValue} onChange={this.handleChange}>
        <NavAction
          component={Link}
          to={ROUTES.HOME}
          label="Discover"
          value={ROUTES.HOME}
          icon={<Home />}
        />
        <NavAction
          component={Link}
          to={ROUTES.GROUPS}
          label="My Groups"
          value={ROUTES.GROUPS}
          icon={<Group />}
        />
        <NavAction
          component={Link}
          to={ROUTES.SETTINGS}
          label="My Profile"
          value={ROUTES.SETTINGS}
          icon={<AccountBox />}
        />
      </Nav>
    );
  }
}

export default withRouter(BottomNav);
