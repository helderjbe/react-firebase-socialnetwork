import React, { Component } from 'react';
import PropTypes from 'prop-types';

import makeCancelable from 'makecancelable';

import sort from 'fast-sort';

import { withSnackbar } from '../../components/Snackbar';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import GroupRow from '../../components/GroupRow';
import { CardContent } from '@material-ui/core';
import { withFirebase } from '../Firebase';

class MyGroupsHandler extends Component {
  state = { data: {}, sortedData: [] };

  componentDidMount() {
    const { api, callSnackbar } = this.props;
    console.log(api);

    this.cancelGetGroups = {};
    this.cancelGetGroupMessages = {};

    this.cancelGetIdToken = makeCancelable(
      api.doGetIdTokenResult(),
      token =>
        Object.keys(token.claims.groups).forEach(
          (gid, index) =>
            (this.cancelGetGroups[index] = makeCancelable(
              api.refGroupById(gid).get(),
              async doc => {
                await this.setState(state => ({
                  data: { ...state.data, [gid]: { ...doc.data() } }
                }));

                this.fetchLastMessage(gid, index);

                delete this.cancelGetGroups[index];
              },
              error => callSnackbar(error.message, 'error')
            ))
        ),
      error => callSnackbar(error.message, 'error')
    );
  }

  componentWillUnmount() {
    if (this.cancelGetIdToken) {
      this.cancelGetIdToken();
    }

    if (this.cancelGetGroups) {
      Object.values(this.cancelGetGroups).forEach(cancelRequest => {
        if (cancelRequest) cancelRequest();
      });
    }

    if (this.cancelGetGroupMessages) {
      Object.values(this.cancelGetGroupMessages).forEach(cancelRequest => {
        if (cancelRequest) cancelRequest();
      });
    }
  }

  fetchLastMessage = (gid, index) => {
    const { api, callSnackbar } = this.props;

    const self = this;

    this.cancelGetGroupMessages[index] = makeCancelable(
      api
        .refGroupMessages(gid)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get(),
      async snapshots => {
        const messageData = snapshots.docs[0] ? snapshots.docs[0].data() : {};

        await this.setState(state => {
          // data
          const data = { ...state.data };
          data[gid] = {
            ...data[gid],
            message: { ...messageData }
          };

          // sortedData
          if (self.groups) {
            self.groups = [
              ...self.groups,
              { date: messageData.createdAt || 0, gid }
            ];
          } else {
            self.groups = [{ date: messageData.createdAt || 0, gid }];
          }

          let sortedData = null;
          if (self.groups.length === Object.keys(data).length) {
            sortedData = sort(self.groups).desc(group => group.date);
          }

          if (sortedData) {
            if (!self.loaded) self.loaded = true;
            return { data, sortedData };
          } else {
            return { data };
          }
        });

        delete this.cancelGetGroupMessages[index];
      },
      error => callSnackbar(error.message, 'error')
    );
  };

  render() {
    const { data, sortedData } = this.state;

    return (
      <Grid container spacing={1}>
        {!this.loaded && (
          <Grid item xs={12}>
            <Box width="100%" textAlign="center" my={2}>
              <CircularProgress />
            </Box>
          </Grid>
        )}
        {sortedData && sortedData.length === 0 && this.loaded && (
          <Grid item xs={12}>
            <Card>
              <CardContent>No groups under your belt yet</CardContent>
            </Card>
          </Grid>
        )}
        {sortedData.map((entry, index) => (
          <Grid item xs={12} key={`grouprow ${index}`}>
            <GroupRow {...data[entry.gid]} gid={entry.gid} />
          </Grid>
        ))}
      </Grid>
    );
  }
}

MyGroupsHandler.propTypes = {
  api: PropTypes.object.isRequired
};

export default withFirebase(withSnackbar(MyGroupsHandler));
