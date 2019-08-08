import React from 'react';
import PropTypes from 'prop-types';

import { Link, withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import defaultBanner from '../../common/images/defaultBanner.jpg';

const GroupRow = props => {
  return (
    <ListItem
      component={Link}
      style={{ textDecoration: 'none', color: 'inherit' }}
      to={ROUTES.GROUPS_ID.replace(':gid', props.gid)}
      alignItems="flex-start"
    >
      <ListItemAvatar>
        <Avatar alt="Banner" src={defaultBanner} />
      </ListItemAvatar>
      <ListItemText
        primary={props.title}
        secondary={
          <Typography variant="body2" color="textPrimary">
            Last message
          </Typography>
        }
      />
    </ListItem>
  );
};

GroupRow.propTypes = {
  banner: PropTypes.bool,
  details: PropTypes.string,
  createdAt: PropTypes.object.isRequired,
  updatedAt: PropTypes.object.isRequired,
  gid: PropTypes.string.isRequired,
  limit: PropTypes.number,
  memberCount: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired
};

export default withRouter(GroupRow);
