import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import makeCancelable from 'makecancelable';

import sort from 'fast-sort';

import { withSnackbar } from '../../components/Snackbar';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import GroupRow from '../../components/GroupRow';
import { CardContent, Typography } from '@material-ui/core';
import { withFirebase } from '../Firebase';

let cancelGetGroupMessages = {};
let datedGroups = [];
let tokenGroups = {};

const MyGroupsHandler = ({ api, callSnackbar }) => {
  const [data, setData] = useState({});
  const [sortedData, setSortedData] = useState([]);

  const fetchLastMessage = useCallback(
    (gid, index) => {
      cancelGetGroupMessages[index] = makeCancelable(
        api
          .refGroupMessages(gid)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get(),
        snapshots => {
          let messageData = {};
          if (snapshots.docs[0]) {
            messageData = snapshots.docs[0].data();
          }

          // data
          setData(prevData => {
            const updatedData = {
              ...prevData,
              [gid]: { ...prevData[gid], message: { ...messageData } }
            };

            // sortedData
            datedGroups.push({ date: messageData.createdAt || 0, gid });

            // TODO: for now it's sorting the array every time. Best is to insert in the right place and keep it sorted.
            if (datedGroups.length === Object.keys(updatedData).length) {
              setSortedData(sort(datedGroups).desc(group => group.date));
            }

            return updatedData;
          });

          delete cancelGetGroupMessages[index];
        },
        error => callSnackbar(error.message, 'error')
      );
    },
    [api, callSnackbar]
  );

  useEffect(() => {
    let cancelGetGroups = {};
    const cancelGetIdToken = makeCancelable(
      api.doGetIdTokenResult(),
      token => {
        tokenGroups = token.claims.groups;
        Object.keys(token.claims.groups).forEach(
          (gid, index) =>
            (cancelGetGroups[index] = makeCancelable(
              api.refGroupById(gid).get(),
              doc => {
                setData(prevData => ({
                  ...prevData,
                  [gid]: { ...prevData[gid], ...doc.data() }
                }));

                fetchLastMessage(gid, index);

                delete cancelGetGroups[index];
              },
              error => callSnackbar(error.message, 'error')
            ))
        );
      },
      error => callSnackbar(error.message, 'error')
    );

    return () => {
      cancelGetIdToken();

      Object.values(cancelGetGroups).forEach(cancelRequest => {
        if (cancelRequest) cancelRequest();
      });

      Object.values(cancelGetGroupMessages).forEach(cancelRequest => {
        if (cancelRequest) cancelRequest();
      });

      cancelGetGroupMessages = {};
      datedGroups = [];
      tokenGroups = {};
    };
  }, [api, callSnackbar, fetchLastMessage]);

  return (
    <Grid container spacing={1}>
      {Object.keys(tokenGroups).length !== sortedData.length && (
        <Grid item xs={12}>
          <Box width="100%" textAlign="center" my={2}>
            <CircularProgress />
          </Box>
        </Grid>
      )}
      {Object.keys(tokenGroups).length === 0 && sortedData.length === 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography align="center" variant="body2" color="textSecondary">
                No groups under your belt yet
              </Typography>
            </CardContent>
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
};

MyGroupsHandler.propTypes = {
  api: PropTypes.object.isRequired
};

export default withFirebase(withSnackbar(MyGroupsHandler));
