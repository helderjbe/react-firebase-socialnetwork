import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';

import makeCancelable from 'makecancelable';

import moment from 'moment';

import { withFirebase } from '../Firebase';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

import RemoveCircle from '@material-ui/icons/RemoveCircle';

import UserProfileModal from '../UserProfileModal';

import defaultAvatar from '../../common/images/defaultAvatar.jpg';

const BanButton = withStyles(theme => ({
  root: {
    color: theme.palette.error.main
  }
}))(IconButton);

const MakeAdminAvatar = withStyles(theme => ({
  root: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    backgroundColor: theme.palette.primary.main
  }
}))(Avatar);

class MemberRow extends Component {
  state = { avatarUrl: null, profileOpen: false };

  componentDidMount() {
    const { api, user, uid } = this.props;

    const avatar = user ? user.avatar : undefined;

    if (avatar) {
      this.cancelRequest = makeCancelable(
        api.refUserAvatar(uid).getDownloadURL(),
        url =>
          this.setState({
            avatarUrl: url
          })
      );
    }
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }
  }

  handleProfileOpen = () => {
    this.setState({ profileOpen: true });
  };

  handleProfileClose = () => {
    this.setState({ profileOpen: false });
  };

  render() {
    const {
      role,
      createdAt,
      user,
      match: {
        params: { gid }
      }
    } = this.props;

    const name = user ? user.name : undefined;
    const about = user ? user.about : undefined;

    const { avatarUrl, profileOpen } = this.state;

    return (
      <>
        <List>
          <ListItem button onClick={this.handleProfileOpen}>
            <ListItemAvatar>
              <Avatar alt="Profile Picture" src={avatarUrl || defaultAvatar} />
            </ListItemAvatar>
            <ListItemText
              primary={name || 'No Name'}
              secondary={
                <Typography variant="body2" color="textPrimary">
                  {createdAt &&
                    `Joined ${moment(createdAt.toDate()).format('ll')}`}
                </Typography>
              }
            />
            {role !== 'admin' && (
              <ListItemSecondaryAction>
                <IconButton color="primary" aria-label="make admin">
                  <MakeAdminAvatar>A</MakeAdminAvatar>
                </IconButton>

                <BanButton edge="end" aria-label="remove">
                  <RemoveCircle />
                </BanButton>
              </ListItemSecondaryAction>
            )}
            {role === 'admin' && (
              <Typography variant="h5" color="textSecondary">
                A
              </Typography>
            )}
          </ListItem>
          {profileOpen && (
            <UserProfileModal
              handleClose={this.handleProfileClose}
              open={profileOpen}
              avatarUrl={avatarUrl}
              name={name}
              about={about}
            />
          )}
        </List>
      </>
    );
  }
}

MemberRow.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.bool,
    about: PropTypes.string,
    name: PropTypes.string
  }),
  match: PropTypes.shape({
    params: PropTypes.object.isRequired
  }),
  role: PropTypes.string.isRequired,
  createdAt: PropTypes.object.isRequired
};

export default withRouter(withFirebase(MemberRow));
