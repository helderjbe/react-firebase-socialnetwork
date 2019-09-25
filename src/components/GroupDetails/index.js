import React, { Component } from 'react';

import moment from 'moment';

import makeCancelable from 'makecancelable';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import Group from '@material-ui/icons/Group';

import defaultBanner from '../../common/images/defaultBanner.jpg';

class GroupDetails extends Component {
  state = {
    title: 'Group title',
    details: '',
    memberCount: 0,
    memberLimit: 2,
    tags: [],
    bannerSrc: defaultBanner
  };
  componentDidMount() {
    const {
      api,
      match: {
        params: { gid }
      },
      callSnackbar
    } = this.props;

    this.cancelRequest = makeCancelable(
      api.refGroupById(gid).get(),
      doc => {
        const docData = doc.data();
        doc.exists && this.setState({ ...docData });
        if (docData.banner) {
          this.cancelRequest2 = makeCancelable(
            api.refGroupBanner(gid).getDownloadURL(),
            url => {
              url && this.setState({ bannerSrc: url });
            }
          );
        }
      },
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
    const {
      title,
      details,
      memberCount,
      memberLimit,
      tags,
      bannerSrc,
      createdAt
    } = this.state;

    return (
      <>
        <img
          alt="Group banner"
          src={bannerSrc || defaultBanner}
          style={{ width: '100%', height: 'auto' }}
        />
        <Box textAlign="center" mt={1} mb={3}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="caption">
            Created {moment(createdAt).format('MMMM Do YYYY')}
          </Typography>
        </Box>
        <Box mt={1} mx={2} lineHeight="1.8rem">
          <Chip
            icon={<Group />}
            size="small"
            label={`${memberCount} / ${memberLimit} members`}
            color="primary"
          />{' '}
          {tags &&
            tags.map((label, index) => (
              <span key={`Tags ${index}`}>
                <Chip size="small" label={label} />{' '}
              </span>
            ))}
        </Box>
        <CardContent>
          <Typography
            paragraph
            align="justify"
            variant="body2"
            style={{ whiteSpace: 'pre-line' }}
          >
            {details}
          </Typography>
        </CardContent>
      </>
    );
  }
}

export default withRouter(withFirebase(withSnackbar(GroupDetails)));
