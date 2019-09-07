import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';

import InfiniteScroll from 'react-infinite-scroller';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Avatar from '@material-ui/core/Avatar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Button } from '@material-ui/core';

import defaultAvatar from '../../common/images/defaultAvatar.jpg';

import UserProfileModal from '../UserProfileModal';

class Applications extends Component {
  state = {
    data: [],
    users: {},
    avatars: {},
    hasMore: true,
    profileIdOpen: null,
    loading: false
  };

  componentDidMount() {
    this.fetchApplications();
  }

  fetchApplications = async () => {
    const snapshotLimit = 15;

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
          .refGroupApplications(gid)
          .orderBy(orderBy, 'desc')
          .startAfter(data[data.length - 1][orderBy])
          .limit(snapshotLimit)
      : api
          .refGroupApplications(gid)
          .orderBy(orderBy, 'desc')
          .limit(snapshotLimit);

    try {
      const snapshots = await query.get();

      snapshots.docs.forEach(snapshot => {
        this.handleUsers(snapshot.id);
        this.setState(state => ({
          data: [...state.data, { ...snapshot.data(), uid: snapshot.id }]
        }));
      });

      if (snapshots.docs.length < snapshotLimit) {
        await this.setState({ hasMore: false });
      }

      this.isFetching = false;
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  handleUsers = async uid => {
    const { api, callSnackbar } = this.props;

    try {
      const doc = await api.refUserById(uid).get();
      const userData = doc.data();

      if (userData && userData.avatar) {
        const url = await api.refUserAvatar(uid).getDownloadURL();

        this.setState(state => ({
          avatars: { ...state.avatars, [uid]: url }
        }));
      } else {
        this.setState(state => ({
          avatars: { ...state.avatars, [uid]: '' }
        }));
      }
      this.setState(state => ({
        users: { ...state.users, [doc.id]: userData || {} }
      }));
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  onAction = (uid, index, accepted) => async () => {
    const {
      api,
      match: {
        params: { gid }
      },
      callSnackbar
    } = this.props;

    await this.setState({ loading: true });

    try {
      if (accepted) {
        await api.refGroupApplicationById(gid, uid).update({ accepted: true });
      }

      await api.refGroupApplicationById(gid, uid).delete();

      await this.setState(state => {
        const data = [...state.data];
        data.splice(index, 1);
        return { data, loading: false };
      });
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  handleProfileIdOpen = profileIdOpen => () => {
    this.setState({ profileIdOpen });
  };

  handleProfileIdClose = () => {
    this.setState({ profileIdOpen: null });
  };

  render() {
    const {
      data,
      hasMore,
      profileIdOpen,
      users,
      avatars,
      loading
    } = this.state;

    return (
      <>
        <InfiniteScroll
          initialLoad={false}
          loadMore={this.fetchApplications}
          hasMore={hasMore}
          loader={
            <Box width="100%" textAlign="center" my={2} key={0}>
              <CircularProgress />
            </Box>
          }
        >
          {data.length === 0 && (this.isFetching || !hasMore) && (
            <Box mt={2}>
              <Typography>No applications received yet</Typography>
            </Box>
          )}
          {data.map((entry, index) => {
            if (!users[entry.uid]) {
              return (
                <Box
                  width="100%"
                  textAlign="center"
                  my={2}
                  key={`loading ${index}`}
                >
                  <CircularProgress color="inherit" size={20} />
                </Box>
              );
            }
            return (
              <ExpansionPanel key={`panel ${index}`}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" justifyContent="left">
                    <Box mr={2}>
                      <Avatar
                        alt="Profile Picture"
                        src={avatars[entry.uid] || defaultAvatar}
                      />
                    </Box>
                    <div>
                      <Typography variant="subtitle1">
                        {users[entry.uid].name
                          ? users[entry.uid].name
                          : 'No Name'}
                      </Typography>
                      <Typography variant="caption">
                        {`${moment(entry.createdAt).fromNow()}`}
                      </Typography>
                    </div>
                  </Box>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ flexDirection: 'column' }}>
                  {entry.application &&
                    Object.entries(entry.application).map(
                      ([question, answer], index) =>
                        question !== '' && (
                          <Box key={`questionAnswer ${index}`} mb={2}>
                            <Typography
                              variant="subtitle1"
                              style={{ whiteSpace: 'pre-line' }}
                            >
                              {question}
                            </Typography>
                            <Typography
                              variant="body2"
                              style={{ whiteSpace: 'pre-line' }}
                            >
                              {answer}
                            </Typography>
                          </Box>
                        )
                    )}
                  <Box display="flex" mt={1}>
                    <Box flexGrow="1">
                      <Button onClick={this.handleProfileIdOpen(entry.uid)}>
                        User Details
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      disabled={loading}
                      onClick={this.onAction(entry.uid, index, false)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      disabled={loading}
                      onClick={this.onAction(entry.uid, index, true)}
                      color="primary"
                    >
                      Accept
                    </Button>
                  </Box>
                  {loading && <LinearProgress />}
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
        </InfiniteScroll>
        {users[profileIdOpen] && (
          <UserProfileModal
            handleClose={this.handleProfileIdClose}
            open={Boolean(profileIdOpen)}
            avatarUrl={avatars[profileIdOpen]}
            name={users[profileIdOpen].name}
            about={users[profileIdOpen].about}
          />
        )}
      </>
    );
  }
}

Applications.propTypes = {
  api: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired
  })
};

export default withRouter(withFirebase(withSnackbar(Applications)));
