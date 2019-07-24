import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import { withFirebase } from '../Firebase';
import { withUserSession } from '../Session';

import Card from '@material-ui/core/Card';
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

import ApplicationDialog from './ApplicationDialog';

import defaultBanner from '../../common/images/defaultBanner.jpg';

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
    const { id, api, banner } = this.props;

    if (banner) {
      api
        .refGroupPublicBanner(id)
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
    this.setState({ applicationDialog: true });
  };
  render() {
    const { groupImgSrc, applicationDialog } = this.state;
    const {
      title,
      details,
      limit,
      memberCount,
      tags,
      id,
      authstate,
      api,
      updatedAt,
      questions
    } = this.props;

    return (
      <Grid item xs={12}>
        <Card>
          <GridListTile component="div">
            <img
              src={groupImgSrc}
              alt={`${title} banner`}
              style={{ width: '100%', height: 'auto' }}
            />
            <GroupGridListTileBar
              title={title}
              subtitle={moment(updatedAt.toDate()).fromNow()}
              titlePosition="top"
              actionPosition="right"
            />
          </GridListTile>
          <Box mt={1} mx={2} lineHeight="1.8rem">
            <Chip
              avatar={
                <Avatar>
                  <Group />
                </Avatar>
              }
              size="small"
              label={`${memberCount} / ${limit} members`}
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
          <CardActions>
            {questions && Object.keys(questions).length && (
              <ApplicationDialog
                gid={id}
                uid={authstate.uid}
                api={api}
                applicationDialog={applicationDialog}
                handleApplicationDialogClose={this.handleApplicationDialogClose}
                questions={questions}
              />
            )}
            <Box ml="auto">
              <Button
                color="primary"
                size="large"
                onClick={this.handleApplicationDialogOpen}
              >
                Join
              </Button>
            </Box>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

GroupCard.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.string),
  authstate: PropTypes.object,
  api: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  banner: PropTypes.bool,
  misc: PropTypes.arrayOf(PropTypes.string),
  details: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.string),
  limit: PropTypes.number.isRequired,
  memberCount: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  updatedAt: PropTypes.object.isRequired
};

export default withFirebase(withUserSession(GroupCard));
