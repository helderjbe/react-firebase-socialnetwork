import React, { Component } from 'react';
import PropTypes from 'prop-types';

import makeCancelable from 'makecancelable';

import InfiniteScroll from 'react-infinite-scroller';

import { withRouter, Link } from 'react-router-dom';
import * as ROUTES from '../../../constants/routes';

import {
  withProtectedRoute,
  withEmailVerification
} from '../../../components/Session';
import { withSnackbar } from '../../../components/Snackbar';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Close from '@material-ui/icons/Close';

import MemberRow from '../../../components/MemberRow';
import { CardContent, Box, withStyles } from '@material-ui/core';

import ConfirmAction from '../../../components/ConfirmAction';

const LeaveButton = withStyles(theme => ({
  root: {
    color: theme.palette.error.main
  }
}))(IconButton);

class MembersGroupPage extends Component {
  state = {
    data: [],
    userData: {},
    leaveDialogOpen: false,
    profileIdOpen: null,
    hasMore: true,
    loading: false
  };

  componentDidMount() {
    this.fetchMembers();
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }

    if (this.cancelRequest2) {
      this.cancelRequest2();
    }
  }

  handleLeaveDialog = () => {
    this.setState(state => ({ leaveDialogOpen: !state.leaveDialogOpen }));
  };

  handleLeave = async () => {
    const {
      authstate,
      api,
      match: {
        params: { gid }
      },
      history,
      callSnackbar
    } = this.props;

    this.setState({ loading: true });

    try {
      await api.refGroupMemberById(gid, authstate.uid).delete();

      callSnackbar('You left the group', 'info');
      history.push(ROUTES.HOME);
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  handleMakeAdmin = async index => {
    const {
      api,
      match: {
        params: { gid }
      },
      callSnackbar
    } = this.props;
    const { userData, data } = this.state;

    const uid = data[index].uid;

    const name = userData[uid] ? userData[uid].name : undefined;

    try {
      await api.refGroupMemberById(gid, uid).update({
        role: 'admin'
      });
      callSnackbar(
        `${name || 'No Name'} is now an admin of this group`,
        'info'
      );
      this.setState(state => {
        const data = [...state.data];
        data[index].role = 'admin';
        return { data };
      });
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  handleBanUser = async index => {
    const {
      api,
      match: {
        params: { gid }
      },
      callSnackbar
    } = this.props;
    const { userData, data } = this.state;

    const uid = data[index].uid;

    const name = userData[uid] ? userData[uid].name : undefined;

    try {
      await api.refGroupMemberById(gid, uid).delete();

      callSnackbar(`${name || 'No Name'} has been banned`, 'info');
      this.setState(state => {
        const data = [...state.data];
        data.splice(index, 1);
        return { data };
      });
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  fetchMembers = () => {
    const snapshotLimit = 25;

    const orderBy = 'createdAt';

    const {
      api,
      match: {
        params: { gid }
      },
      callSnackbar
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

    this.cancelRequest = makeCancelable(
      query.get(),
      snapshots => {
        snapshots.docs.forEach(snapshot => {
          this.cancelRequest2 = makeCancelable(
            api.refUserById(snapshot.id).get(),
            userSnapshot => {
              this.setState(state => ({
                data: [...state.data, { ...snapshot.data(), uid: snapshot.id }],
                userData: { [userSnapshot.id]: { ...userSnapshot.data() } }
              }));
            },
            error => callSnackbar(error.message, 'error')
          );
        });

        if (snapshots.docs.length < snapshotLimit)
          return this.setState({ hasMore: false });

        this.isFetching = false;
      },
      error => callSnackbar(error.message, 'error')
    );
  };

  render() {
    const { data, hasMore, userData, leaveDialogOpen, loading } = this.state;
    const {
      match: {
        params: { gid }
      }
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
            return (
              <Grid item xs={12} key={`memberrow ${index}`}>
                <Card>
                  <MemberRow
                    {...entry}
                    user={userData[entry.uid]}
                    uid={entry.uid}
                    entryIndex={index}
                    handleBanUser={this.handleBanUser}
                    handleMakeAdmin={this.handleMakeAdmin}
                    loading={loading}
                  />
                </Card>
              </Grid>
            );
          })}
        </Grid>
        {leaveDialogOpen && (
          <ConfirmAction
            handleClose={this.handleLeaveDialog}
            open={leaveDialogOpen}
            handleAction={this.handleLeave}
            red={true}
            dialogTitle="Are you sure you want to leave this group?"
            loading={loading}
            text="Leave"
          />
        )}
      </>
    );
  }
}

MembersGroupPage.propTypes = {
  api: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  authstate: PropTypes.object,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired
  })
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(
  withEmailVerification(withRouter(withSnackbar(MembersGroupPage)))
);
