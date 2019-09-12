import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import makeCancelable from 'makecancelable';

import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import { Link, withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import Card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

class GroupRow extends Component {
  state = {
    bannerUrl: null
  };

  componentDidMount() {
    const { gid, api, banner } = this.props;

    if (banner) {
      this.cancelRequest = makeCancelable(
        api.refGroupBanner(gid).getDownloadURL(),
        url => url && this.setState({ bannerUrl: url })
      );
    }
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }
  }

  render() {
    const {
      title,
      gid,
      message: { createdAt, text }
    } = this.props;
    const { bannerUrl } = this.state;

    return (
      <Card style={{ position: 'relative' }}>
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt={`${title} banner`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 'auto',
              opacity: 0.1
            }}
          />
        )}
        <List style={{ padding: 0 }}>
          <ListItem
            button
            component={Link}
            to={ROUTES.GROUPS_ID.replace(':gid', gid)}
          >
            <ListItemText
              primary={title}
              secondary={
                <Typography
                  variant="caption"
                  color="textPrimary"
                  display="block"
                >
                  {createdAt
                    ? `"${text}", ${moment(createdAt).fromNow()}`
                    : 'No messages'}
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Card>
    );
  }
}

GroupRow.propTypes = {
  api: PropTypes.object.isRequired,
  gid: PropTypes.string.isRequired,
  closed: PropTypes.bool,
  memberCount: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  banner: PropTypes.bool,
  message: PropTypes.shape({
    createdAt: PropTypes.number,
    text: PropTypes.string
  })
};

export default withRouter(withFirebase(withSnackbar(GroupRow)));
