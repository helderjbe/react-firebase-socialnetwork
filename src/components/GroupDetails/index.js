import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Group from '@material-ui/icons/Group';

import defaultBanner from '../../common/images/defaultBanner.jpg';

class GroupDetails extends Component {
  state = {
    error: null
  };

  componentDidMount() {
    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    api
      .refGroupById(gid)
      .get()
      .then(doc => {
        doc.exists && this.setState({ ...doc.data() });
      })
      .then(() => {
        const { banner } = this.state;
        if (banner) {
          return api.refGroupBanner(gid).getDownloadURL();
        }
      })
      .then(url => {
        url && this.setState({ bannerSrc: url });
      })
      .catch(error => this.setState({ error }));
  }

  render() {
    const {
      title,
      details,
      memberCount,
      limit,
      tags,
      bannerSrc,
      error
    } = this.state;

    return (
      <>
        <img
          alt="Group banner"
          src={bannerSrc || defaultBanner}
          style={{ width: '100%', height: 'auto' }}
        />
        <Box textAlign="center" mt={1} mb={3}>
          <Typography variant="h6" component="h1">
            {title}
          </Typography>
        </Box>
        <Box mt={1} mx={2} lineHeight="1.8rem">
          <Chip
            avatar={
              <Avatar>
                <Group />
              </Avatar>
            }
            size="small"
            label={`${memberCount} ${limit !== 0 ? `/ ${limit} ` : ''}${
              limit !== 0 || memberCount !== 1 ? 'members' : 'member'
            }`}
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
        <Typography color="error" variant="body2">
          {error && error.message}
        </Typography>
      </>
    );
  }
}

export default withRouter(withFirebase(GroupDetails));
