import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { withNotifications } from '../Notifications';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';

import { makeStyles } from '@material-ui/styles';

import defaultAvatar from '../../common/images/defaultAvatar.jpg';

const useStyles = makeStyles({
  primary: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
});

const NotificationPopper = ({
  anchorEl,
  handleClose,
  notifications,
  api,
  callSnackbar
}) => {
  const classes = useStyles();

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popper' : undefined;

  const [users, setUsers] = useState({});
  const [avatars, setAvatars] = useState({});
  const [groups, setGroups] = useState({});

  const handleNewUser = useCallback(
    async uid => {
      try {
        const doc = await api.refUserById(uid).get();
        const userData = doc.data();

        if (userData && userData.avatar) {
          const url = await api.refUserAvatar(uid).getDownloadURL();
          setAvatars(prevAvatars => ({ ...prevAvatars, [uid]: url }));
        } else {
          setAvatars(prevAvatars => ({ ...prevAvatars, [uid]: '' }));
        }
        setUsers(prevUsers => ({ ...prevUsers, [doc.id]: userData }));
      } catch (error) {
        callSnackbar(error.message, 'error');
      }
    },
    [api, callSnackbar]
  );

  useEffect(() => {
    if (notifications.length) {
      notifications.forEach(async snapshot => {
        const groupDoc = await api.refGroupById(snapshot.gid).get();
        const groupData = groupDoc.data();

        setGroups(prevGroups => ({
          ...prevGroups,
          [snapshot.gid]: { ...groupData }
        }));

        if (snapshot.uid && !(snapshot.uid in users)) {
          handleNewUser(snapshot.uid);
        }
      });
    }
  }, [api, callSnackbar, handleNewUser, notifications, users]);

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      <Paper>
        <List>
          {notifications.map((snapshot, index) => {
            const userData = users[snapshot.uid] || {};
            const avatarUrl = avatars[snapshot.uid] || '';
            const groupData = groups[snapshot.gid] || {};
            return (
              <div key={`Notification${index}`}>
                <ListItem
                  button
                  component={Link}
                  to={
                    snapshot.type === 'accepted'
                      ? ROUTES.GROUPS_ID.replace(':gid', snapshot.gid)
                      : ROUTES.GROUPS_ID_APPLICATIONS.replace(
                          ':gid',
                          snapshot.gid
                        )
                  }
                  onClick={handleClose}
                  alignItems="flex-start"
                >
                  {snapshot.uid && (
                    <ListItemAvatar>
                      <Avatar
                        alt={userData.name || 'No Name'}
                        src={avatarUrl || defaultAvatar}
                      />
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    className={classes.primary}
                    primary={
                      snapshot.type === 'accepted'
                        ? `You have joined the group ${groupData.title}`
                        : `${userData.name || 'No Name'} applied to ${
                            groupData.title
                          }`
                    }
                    secondary={moment(snapshot.createdAt).fromNow()}
                  />
                </ListItem>
                {notifications[index + 1] && (
                  <Divider variant="inset" component="li" />
                )}
              </div>
            );
          })}
          {notifications.length === 0 && (
            <Box my={1.5} mx="auto" px={3}>
              <Typography align="center" variant="body2" color="textSecondary">
                No new notifications
              </Typography>
            </Box>
          )}
        </List>
      </Paper>
    </Popover>
  );
};

NotificationPopper.propTypes = {
  anchorEl: PropTypes.object,
  handleClose: PropTypes.func.isRequired,
  notifications: PropTypes.array.isRequired,
  api: PropTypes.object.isRequired,
  callSnackbar: PropTypes.func.isRequired
};

export default withFirebase(
  withNotifications(withSnackbar(NotificationPopper))
);
