import React, { Component } from 'react';
import PropTypes from 'prop-types';

import makeCancelable from 'makecancelable';

import InfiniteScroll from 'react-infinite-scroller';

import {
  withProtectedRoute,
  withEmailVerification
} from '../../components/Session';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Box } from '@material-ui/core';

import GroupRow from '../../components/GroupRow';
import { CardContent } from '@material-ui/core';

class GroupsPage extends Component {
  state = { data: [], errorMsg: '', hasMore: true };

  componentDidMount() {
    const { api } = this.props;

    this.groupIds = null;
    this.cancelRequest2 = {};

    this.cancelRequest = makeCancelable(
      api.doGetIdTokenResult(),
      token => {
        if (!('groups' in token.claims)) {
          return this.setState({ hasMore: false });
        }
        this.groupIds = Object.keys(token.claims.groups);
        this.fetchGroups();
      },
      error => this.setState({ error })
    );
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }

    if (this.cancelRequest2) {
      Object.values(this.cancelRequest2).forEach(cancelRequest =>
        cancelRequest()
      );
    }
  }

  fetchGroups = () => {
    const sliceLimit = 10;

    const { api } = this.props;
    const { data, hasMore } = this.state;

    if (!hasMore) return false;

    const slice = this.groupIds.slice(data.length, data.length + sliceLimit);

    data.length + slice.length >= this.groupIds.length &&
      this.setState({ hasMore: false });

    slice.forEach((gid, index) => {
      this.cancelRequest2[index] = makeCancelable(
        api.refGroupById(gid).get(),
        doc => {
          this.setState(state => ({
            data: [...state.data, { ...doc.data(), gid: doc.id }]
          }));
          delete this.cancelRequest2[index];
          if (!this.loaded) this.loaded = true;
        },
        error => this.setState({ error })
      );
    });
  };

  render() {
    const { data, errorMsg, hasMore } = this.state;

    return (
      <Grid
        component={InfiniteScroll}
        container
        spacing={1}
        initialLoad={false}
        loadMore={this.fetchGroups}
        hasMore={hasMore}
        loader={
          <Box width="100%" textAlign="center" my={2} key={0}>
            <CircularProgress />
          </Box>
        }
      >
        {data.length === 0 && errorMsg === '' && (this.loaded || !hasMore) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>No groups under your belt yet</CardContent>
            </Card>
          </Grid>
        )}
        {data.map((entry, index) => (
          <Grid item xs={12} key={`grouprow ${index}`}>
            <GroupRow {...entry} />
          </Grid>
        ))}

        {errorMsg !== '' ? errorMsg : null}
      </Grid>
    );
  }
}

GroupsPage.propTypes = {
  api: PropTypes.object.isRequired
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(withEmailVerification(GroupsPage));
