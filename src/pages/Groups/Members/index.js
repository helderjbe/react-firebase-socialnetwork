import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InfiniteScroll from 'react-infinite-scroller';

import { withRouter, Link } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

import { withProtectedRoute } from '../../../components/Session';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Close from '@material-ui/icons/Close';

import MemberRow from '../../../components/MemberRow';
import { CardContent, Box, withStyles } from '@material-ui/core';

import LeaveDialog from './leaveGroup';

const LeaveButton = withStyles(theme => ({
  root: {
    color: theme.palette.error.main
  }
}))(IconButton);

class MembersGroupPage extends Component {
  state = {
    errorMsg: '',
    data: [],
    userData: {},
    leaveDialogOpen: false,
    profileIdOpen: null,
    hasMore: true
  };

  componentDidMount() {
    this.fetchMembers();
  }

  handleLeaveDialog = () => {
    this.setState(state => ({ leaveDialogOpen: !state.leaveDialogOpen }));
  };

  fetchMembers = () => {
    const snapshotLimit = 25;

    const orderBy = 'createdAt';

    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;
    const { data, hasMore } = this.state;

    if (!hasMore || this.isFetching) return false;
    this.isFetching = true;

    const query = data.length
      ? api
          .refGroupMembers(gid)
          .orderBy(orderBy, 'desc')
          .startAfter(data[data.length - 1][orderBy])
          .limit(snapshotLimit)
      : api
          .refGroupMembers(gid)
          .orderBy(orderBy, 'desc')
          .limit(snapshotLimit);

    query
      .get()
      .then(snapshots => {
        snapshots.docs.forEach(snapshot => {
          api
            .refUserById(snapshot.id)
            .get()
            .then(userSnapshot => {
              this.setState(state => ({
                data: [...state.data, { ...snapshot.data(), uid: snapshot.id }],
                userData: { [userSnapshot.id]: { ...userSnapshot.data() } }
              }));
            });
        });
        return snapshots.docs.length;
      })
      .then(snapshotLength => {
        if (snapshotLength < snapshotLimit)
          return this.setState({ hasMore: false });
      })
      .then(() => (this.isFetching = false))
      .catch(error => {
        this.setState({ errorMsg: error.message });
      });
  };

  render() {
    const { errorMsg, data, hasMore, userData, leaveDialogOpen } = this.state;
    const {
      match: {
        params: { gid }
      },
      authstate,
      api
    } = this.props;

    return (
      <>
        <Box mb={1} display="flex">
          <Box flexGrow={1}>
            <IconButton
              aria-label="back"
              component={Link}
              to={ROUTES.GROUPS_ID.replace(':gid', gid)}
            >
              <ArrowBack />
            </IconButton>
          </Box>
          <LeaveButton onClick={this.handleLeaveDialog}>
            <Close />
          </LeaveButton>
        </Box>
        <Grid
          component={InfiniteScroll}
          container
          spacing={1}
          initialLoad={false}
          loadMore={this.fetchMembers}
          hasMore={hasMore}
          loader={
            <Box width="100%" textAlign="center" my={2} key={0}>
              <CircularProgress />
            </Box>
          }
        >
          {data.map((entry, index) => {
            console.log(entry);
            return (
              <Grid item xs={12} key={`memberrow ${index}`}>
                <Card>
                  <MemberRow {...entry} user={userData[entry.uid]} />
                </Card>
              </Grid>
            );
          })}

          {errorMsg !== '' ? errorMsg : null}
        </Grid>
        <LeaveDialog
          handleClose={this.handleLeaveDialog}
          open={leaveDialogOpen}
          authstate={authstate}
          api={api}
          gid={gid}
        />
      </>
    );
  }
}

MembersGroupPage.propTypes = {
  api: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(withRouter(MembersGroupPage));
