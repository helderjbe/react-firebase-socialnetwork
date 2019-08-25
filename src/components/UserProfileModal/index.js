import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Avatar from '@material-ui/core/Avatar';

import defaultAvatar from '../../common/images/defaultAvatar.jpg';
import { Box } from '@material-ui/core';

const UserProfileModal = props => {
  const { handleClose, name, about, avatarUrl, open } = props;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="body"
      aria-labelledby="name"
      fullWidth
    >
      <Box my={2}>
        <Avatar
          alt="Profile picture"
          src={avatarUrl || defaultAvatar}
          style={{ width: 150, height: 150, margin: '0 auto' }}
        />
      </Box>
      <Box textAlign="center">
        <DialogTitle id="name">{name || 'No Name'}</DialogTitle>
      </Box>
      <DialogContent>
        <DialogContentText style={{ whiteSpace: 'pre-line' }}>
          {about}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

UserProfileModal.propTypes = {
  handleClose: PropTypes.func,
  avatarUrl: PropTypes.string,
  name: PropTypes.string,
  about: PropTypes.string,
  open: PropTypes.bool,
  uid: PropTypes.string
};

export default UserProfileModal;
