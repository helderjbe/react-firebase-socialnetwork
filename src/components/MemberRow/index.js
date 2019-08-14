import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { withFirebase } from '../Firebase';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import UserProfileModal from '../UserProfileModal';

import defaultAvatar from '../../common/images/defaultAvatar.jpg';

class MemberRow extends Component {
  state = { avatarUrl: null, profileOpen: false };

  componentDidMount() {
    const {
      api,
      user: { avatar },
      uid
    } = this.props;

    if (avatar) {
      api
        .refUserAvatar(uid)
        .getDownloadURL()
        .then(url => {
          this.setState({
            avatarUrl: url
          });
        });
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
      user: { name, about }
    } = this.props;

    const { avatarUrl, profileOpen } = this.state;

    return (
      <>
        <ListItem
          button
          onClick={this.handleProfileOpen}
          style={{ textDecoration: 'none', color: 'inherit' }}
          alignItems="flex-start"
        >
          <ListItemAvatar>
            <Avatar alt="Profile Picture" src={avatarUrl || defaultAvatar} />
          </ListItemAvatar>
          <ListItemText
            primary={name}
            secondary={
              <Typography variant="body2" color="textPrimary">
                {createdAt &&
                  `Joined ${moment(createdAt.toDate()).format('ll')}`}
              </Typography>
            }
          />
          <Typography variant="h5" color="textSecondary">
            A
          </Typography>
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
      </>
    );
  }
}

MemberRow.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.bool,
    about: PropTypes.string,
    name: PropTypes.string.isRequired
  }),
  role: PropTypes.string.isRequired,
  createdAt: PropTypes.object.isRequired
};

export default withFirebase(MemberRow);
