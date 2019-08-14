import React, { Component } from 'react';

import moment from 'moment';

import InfiniteScroll from 'react-infinite-scroller';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
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
    errorMsg: '',
    profileIdOpen: null
  };

  componentDidMount() {
    this.fetchApplications();
  }

  fetchApplications = () => {
    const snapshotLimit = 15;

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
          .refGroupApplications(gid)
          .orderBy(orderBy, 'desc')
          .startAfter(data[data.length - 1][orderBy])
          .limit(snapshotLimit)
      : api
          .refGroupApplications(gid)
          .orderBy(orderBy, 'desc')
          .limit(snapshotLimit);

    query
      .get()
      .then(snapshots => {
        snapshots.docs.forEach(snapshot => {
          this.handleUsers(snapshot.id);
          this.setState(state => ({
            data: [...state.data, { ...snapshot.data(), uid: snapshot.id }]
          }));
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

  handleUsers = uid => {
    const { api } = this.props;

    api
      .refUserById(uid)
      .get()
      .then(doc => {
        const userData = doc.data();
        if (userData.avatar) {
          api
            .refUserAvatar(uid)
            .getDownloadURL()
            .then(url => {
              this.setState(state => ({
                avatars: { ...state.avatars, [uid]: url }
              }));
            });
        } else {
          this.setState(state => ({
            avatars: { ...state.avatars, [uid]: '' }
          }));
        }
        this.setState(state => ({
          users: { ...state.users, [doc.id]: userData }
        }));
      })
      .catch(error => {
        this.setState({ errorMsg: error.message });
      });
  };

  onAccept = (uid, index) => () => {
    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    api
      .refGroupApplicationById(gid, uid)
      .update({ accepted: true })
      .then(() => {
        api.refGroupApplicationById(gid, uid).delete();
      })
      .then(() => {
        this.setState(state => ({ data: [...state.data.splice(index)] }));
      })
      .catch(error => {
        this.setState({ errorMsg: error.message });
      });
  };

  onDecline = (uid, index) => () => {
    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    api
      .refGroupApplicationById(gid, uid)
      .delete()
      .then(() => {
        this.setState(state => ({ data: [...state.data.splice(index)] }));
      })
      .catch(error => {
        this.setState({ errorMsg: error.message });
      });
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
      errorMsg,
      hasMore,
      profileIdOpen,
      users,
      avatars
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
                        {users[entry.uid].name}
                      </Typography>
                      <Typography variant="caption">
                        {`${moment(entry.createdAt.toDate()).fromNow()}`}
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
                            <Typography variant="subtitle1">
                              {question}
                            </Typography>
                            <Typography variant="body2">{answer}</Typography>
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
                      onClick={this.onDecline(entry.uid, index)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="contained"
                      onClick={this.onAccept(entry.uid, index)}
                      color="primary"
                    >
                      Accept
                    </Button>
                  </Box>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            );
          })}
          {errorMsg !== '' ? errorMsg : null}
        </InfiniteScroll>
        {users[profileIdOpen] && (
          <UserProfileModal
            handleClose={this.handleProfileIdClose}
            open={Boolean(profileIdOpen)}
            avatarUrl={avatars[profileIdOpen]}
            name={users[profileIdOpen].name}
            bio={users[profileIdOpen].about}
          />
        )}
      </>
    );
  }
}

export default withRouter(withFirebase(Applications));
