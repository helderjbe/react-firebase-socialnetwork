import React, { Component } from 'react';
import PropTypes from 'prop-types';

import makeCancelable from 'makecancelable';

import moment from 'moment';

import { withFirebase } from '../Firebase';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';

import RemoveCircle from '@material-ui/icons/RemoveCircle';

import UserProfileModal from '../UserProfileModal';
import ConfirmAction from '../ConfirmAction';

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
  state = {
    avatarUrl: null,
    profileOpen: false,
    confirmActionOpen: false,
    makeAdmin: false,
    loading: false
  };

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

  handleConfirmActionOpen = makeAdmin => () => {
    this.setState({
      confirmActionOpen: true,
      makeAdmin
    });
  };

  handleConfirmActionClose = () => {
    this.setState({
      confirmActionOpen: false
    });
  };

  handleActionType = type => {
    const { handleBanUser, handleMakeAdmin, entryIndex } = this.props;

    switch (type) {
      case 'admin':
        return handleMakeAdmin(entryIndex);
      case 'ban':
        return handleBanUser(entryIndex);
      default:
        return;
    }
  };

  handleAction = type => async () => {
    await this.setState({ loading: true });

    await this.handleActionType(type);

    this.setState({ loading: false });
    this.handleConfirmActionClose();
  };

  render() {
    const { role, createdAt, user } = this.props;

    const name = user ? user.name : undefined;
    const about = user ? user.about : undefined;

    const {
      avatarUrl,
      profileOpen,
      confirmActionOpen,
      makeAdmin,
      loading
    } = this.state;

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
                  {createdAt && `Joined ${moment(createdAt).format('ll')}`}
                </Typography>
              }
            />
            {role !== 'admin' && (
              <ListItemSecondaryAction>
                <IconButton
                  color="primary"
                  aria-label="make admin"
                  onClick={this.handleConfirmActionOpen(true)}
                >
                  <MakeAdminAvatar>A</MakeAdminAvatar>
                </IconButton>

                <BanButton
                  edge="end"
                  aria-label="remove"
                  onClick={this.handleConfirmActionOpen(false)}
                >
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
          {confirmActionOpen && (
            <ConfirmAction
              handleClose={this.handleConfirmActionClose}
              open={confirmActionOpen}
              handleAction={
                makeAdmin
                  ? this.handleAction('admin')
                  : this.handleAction('ban')
              }
              text={makeAdmin ? 'Accept' : 'Ban'}
              red={!makeAdmin}
              dialogTitle={
                makeAdmin
                  ? `Make ${name || 'No Name'} admin?`
                  : `Ban ${name || 'No Name'}?`
              }
              loading={loading}
            />
          )}
        </List>
      </>
    );
  }
}

MemberRow.propTypes = {
  handleBanUser: PropTypes.func,
  handleMakeAdmin: PropTypes.func,
  user: PropTypes.shape({
    avatar: PropTypes.bool,
    about: PropTypes.string,
    name: PropTypes.string
  }),
  uid: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  entryIndex: PropTypes.number.isRequired
};

export default withFirebase(MemberRow);
