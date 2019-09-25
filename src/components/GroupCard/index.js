import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ReadMoreReact from 'read-more-react';

import { Highlight } from 'react-instantsearch-dom';

import makeCancelable from 'makecancelable';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import moment from 'moment';

import { withFirebase } from '../Firebase';
import { withUserSession } from '../Session';
import { withSnackbar } from '../Snackbar';

import CardContent from '@material-ui/core/CardContent';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import Box from '@material-ui/core/Box';

import Group from '@material-ui/icons/Group';
import PersonAdd from '@material-ui/icons/PersonAdd';

import ApplicationDialog from './ApplicationDialog';

import defaultBanner from '../../common/images/defaultBanner.jpg';
import { CardActionArea, Tooltip } from '@material-ui/core';

const GroupGridListTileBar = withStyles({
  root: {
    background:
      'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
  },
  title: {
    fontWeight: 500,
    fontSize: '1.1rem'
  }
})(GridListTileBar);

class GroupCard extends Component {
  state = { groupImgSrc: defaultBanner, applicationDialog: false };

  componentDidMount() {
    const { gid, api, banner } = this.props;

    if (banner) {
      this.cancelRequest = makeCancelable(
        api.refGroupBanner(gid).getDownloadURL(),
        url => this.setState({ groupImgSrc: url })
      );
    }
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }
  }

  handleApplicationDialogClose = () => {
    this.setState({ applicationDialog: false });
  };

  handleApplicationDialogOpen = async () => {
    const { authstate, history, api, gid, callSnackbar } = this.props;

    if (!authstate) {
      callSnackbar('Please sign in first to apply to this group', 'warning');
      return history.push(ROUTES.SIGN_IN);
    }

    const token = await api.doGetIdTokenResult();

    if (
      !authstate.emailVerified &&
      authstate.providerData
        .map(provider => provider.providerId)
        .includes('password')
    ) {
      return callSnackbar(
        'Please validate your e-mail first before applying',
        'error'
      );
    } else if (
      token.claims &&
      token.claims.groups &&
      token.claims.groups[gid]
    ) {
      return callSnackbar("You're already a part of this group", 'error');
    } else {
      return this.setState({ applicationDialog: true });
    }
  };

  render() {
    const { groupImgSrc, applicationDialog } = this.state;
    const {
      title,
      memberCount,
      memberLimit,
      tags,
      gid,
      authstate,
      api,
      updatedAt,
      createdAt,
      details,
      questions
    } = this.props;

    return (
      <>
        <Tooltip disableHoverListener title={`Apply to ${title}`}>
          <CardActionArea onClick={this.handleApplicationDialogOpen}>
            <GridListTile component="div">
              <img
                src={groupImgSrc}
                alt={`${title} banner`}
                style={{ width: '100%', height: 'auto' }}
              />
              <GroupGridListTileBar
                title={<Highlight attribute="title" hit={this.props} />}
                subtitle={
                  updatedAt
                    ? `Updated ${moment(updatedAt).fromNow()}`
                    : `Created ${moment(createdAt).fromNow()}`
                }
                actionIcon={
                  <Box p={2}>
                    <PersonAdd color="secondary" />
                  </Box>
                }
                titlePosition="top"
                actionPosition="right"
              />
            </GridListTile>
          </CardActionArea>
        </Tooltip>
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
            component="div"
            paragraph
            align="justify"
            variant="body2"
            style={{ whiteSpace: 'pre-line' }}
          >
            <ReadMoreReact
              text={details || ''}
              min={160}
              ideal={230}
              max={320}
              readMoreText={
                <Typography
                  component="span"
                  variant="overline"
                  color="textSecondary"
                  style={{ cursor: 'pointer' }}
                >
                  Read more ...
                </Typography>
              }
            />
          </Typography>
        </CardContent>
        {authstate && (
          <ApplicationDialog
            gid={gid}
            uid={authstate.uid}
            api={api}
            applicationDialog={applicationDialog}
            handleApplicationDialogClose={this.handleApplicationDialogClose}
            title={title}
            questions={questions}
          />
        )}
      </>
    );
  }
}

GroupCard.propTypes = {
  bannerUrl: PropTypes.string,
  questions: PropTypes.arrayOf(PropTypes.string),
  authstate: PropTypes.object,
  api: PropTypes.object.isRequired,
  gid: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  banner: PropTypes.bool,
  details: PropTypes.string,
  memberCount: PropTypes.number,
  memberLimit: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number
};

export default withRouter(
  withFirebase(withUserSession(withSnackbar(GroupCard)))
);
