import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import moment from 'moment';

import { withFirebase } from '../Firebase';
import { withUserSession } from '../Session';

import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import Group from '@material-ui/icons/Group';
import AddBox from '@material-ui/icons/AddBox';

import ApplicationDialog from './ApplicationDialog';

import defaultBanner from '../../common/images/defaultBanner.jpg';
import { CardActionArea } from '@material-ui/core';

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
      api
        .refGroupPublicBanner(gid)
        .getDownloadURL()
        .then(url => {
          this.setState({ groupImgSrc: url });
        })
        .catch(error => {
          console.error(error.message);
        });
    }
  }

  handleApplicationDialogClose = () => {
    this.setState({ applicationDialog: false });
  };

  handleApplicationDialogOpen = () => {
    const { authstate, history } = this.props;
    if (authstate) {
      this.setState({ applicationDialog: true });
    } else {
      history.push(ROUTES.SIGN_IN);
    }
  };

  render() {
    const { groupImgSrc, applicationDialog } = this.state;
    const {
      title,
      details,
      limit,
      memberCount,
      tags,
      gid,
      authstate,
      api,
      updatedAt,
      questions
    } = this.props;

    return (
      <>
        <CardActionArea onClick={this.handleApplicationDialogOpen}>
          <GridListTile component="div">
            <img
              src={groupImgSrc}
              alt={`${title} banner`}
              style={{ width: '100%', height: 'auto' }}
            />
            <GroupGridListTileBar
              title={title}
              subtitle={`Updated ${moment(updatedAt.toDate()).fromNow()}`}
              titlePosition="top"
              actionPosition="right"
            />
          </GridListTile>
        </CardActionArea>
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
        {authstate && (
          <ApplicationDialog
            gid={gid}
            uid={authstate.uid}
            api={api}
            applicationDialog={applicationDialog}
            handleApplicationDialogClose={this.handleApplicationDialogClose}
            questions={questions}
          />
        )}
      </>
    );
  }
}

GroupCard.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.string),
  authstate: PropTypes.object,
  api: PropTypes.object.isRequired,
  gid: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  banner: PropTypes.bool,
  details: PropTypes.string,
  limit: PropTypes.number,
  memberCount: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  updatedAt: PropTypes.object.isRequired
};

export default withRouter(withFirebase(withUserSession(GroupCard)));
