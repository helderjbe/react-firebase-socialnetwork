import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withFirebase } from '../Firebase';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import UserProfileModal from '../UserProfileModal';

import defaultBanner from '../../common/images/defaultBanner.jpg';

class MemberRow extends Component {
  state = { avatarUrl: null, profileOpen: false };

  componentDidMount() {
    const {
      api,
      data: { avatar },
      uid
    } = this.props;

    if (avatar) {
      api
        .refUserPublicAvatar(uid)
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
      data: { name, bio, location, contact },
      uid
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
            <Avatar alt="Banner" src={avatarUrl || defaultBanner} />
          </ListItemAvatar>
          <ListItemText
            primary={name}
            secondary={
              <Typography variant="body2" color="textPrimary">
                {location}
              </Typography>
            }
          />
        </ListItem>
        {profileOpen && (
          <UserProfileModal
            handleClose={this.handleProfileClose}
            open={profileOpen}
            avatarUrl={avatarUrl}
            name={name}
            bio={bio}
            location={location}
            contact={contact}
          />
        )}
      </>
    );
  }
}

MemberRow.propTypes = {
  data: PropTypes.shape({
    avatar: PropTypes.bool,
    bio: PropTypes.string,
    location: PropTypes.string,
    contact: PropTypes.string,
    name: PropTypes.string.isRequired
  }),
  uid: PropTypes.string.isRequired
};

export default withFirebase(MemberRow);
