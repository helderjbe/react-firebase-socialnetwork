import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import makeCancelable from 'makecancelable';

import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import { Link, withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import ButtonBase from '@material-ui/core/ButtonBase';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import defaultBanner from '../../common/images/defaultBanner.jpg';

class GroupRow extends Component {
  state = {
    bannerUrl: null
  };

  componentDidMount() {
    const { gid, api, banner, callSnackbar } = this.props;

    if (banner) {
      this.cancelRequest = makeCancelable(
        api.refGroupBanner(gid).getDownloadURL(),
        url => url && this.setState({ bannerUrl: url })
      );
    }

    this.cancelRequest2 = makeCancelable(
      api
        .refGroupMessages(gid)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get(),
      snapshots =>
        snapshots.forEach(snapshot => this.setState({ ...snapshot.data() })),
      error => callSnackbar(error.message, 'error')
    );
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }

    if (this.cancelRequest2) {
      this.cancelRequest2();
    }
  }

  render() {
    const { title, gid } = this.props;
    const { bannerUrl, from, createdAt, text } = this.state;

    return (
      <ButtonBase
        component={Link}
        to={ROUTES.GROUPS_ID.replace(':gid', gid)}
        style={{ display: 'block' }}
      >
        <GridListTile component="div">
          <img
            src={bannerUrl || defaultBanner}
            alt={`${title} banner`}
            style={{ width: '100%', height: 'auto' }}
          />
          <GridListTileBar
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            title={title}
            subtitle={
              createdAt
                ? `[ ${moment(createdAt).fromNow()} ] ${text}`
                : 'No messages'
            }
            titlePosition="top"
          />
        </GridListTile>
      </ButtonBase>
    );
  }
}

GroupRow.propTypes = {
  api: PropTypes.object.isRequired,
  gid: PropTypes.string.isRequired,
  closed: PropTypes.bool,
  memberCount: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  banner: PropTypes.bool
};

export default withRouter(withFirebase(withSnackbar(GroupRow)));
