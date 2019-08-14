import React, { Component } from 'react';

import { Link, withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

import InfiniteScroll from 'react-infinite-scroller';

import { withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import Image from '@material-ui/icons/Image';
import Send from '@material-ui/icons/Send';
import Person from '@material-ui/icons/Person';
import Description from '@material-ui/icons/Description';
import Settings from '@material-ui/icons/Settings';
import FolderShared from '@material-ui/icons/FolderShared';
import { styled, useTheme } from '@material-ui/core/styles';

import UserProfileModal from '../UserProfileModal';

import defaultAvatar from '../../common/images/defaultAvatar.jpg';

const InputContainer = withStyles(theme => ({
  root: {
    padding: theme.spacing(0.25, 0.5),
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.palette.secondary.dark
  }
}))(Paper);

const MessageInput = withStyles(theme => ({
  root: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  input: {
    padding: theme.spacing(1, 0)
  }
}))(InputBase);

const VertDivider = withStyles(theme => ({
  root: {
    width: 1,
    height: theme.spacing(3),
    margin: theme.spacing(0.5)
  }
}))(Divider);

const MessageCard = withStyles(() => ({
  root: {
    maxWidth: '70%',
    whiteSpace: 'pre-line'
  }
}))(Card);

const TopBar = styled('div')({
  display: 'flex',
  alignItems: 'center'
});

const MessageContainer = styled('div')({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column-reverse',
  overflow: 'auto'
});

const Message = props => {
  const { children, left, uid, handleProfileIdOpen, avatarUrl, name } = props;
  const theme = useTheme();

  return (
    <Box pb={2} px={2} display="flex">
      {left ? (
        <Box mr={2} display="flex" alignItems="flex-end">
          <IconButton onClick={handleProfileIdOpen(uid)} style={{ padding: 0 }}>
            <Avatar alt={name} src={avatarUrl || defaultAvatar} />
          </IconButton>
        </Box>
      ) : (
        <Box flexGrow={1} />
      )}
      <MessageCard
        style={{
          backgroundColor: left
            ? theme.palette.secondary.dark
            : theme.palette.primary.light
        }}
      >
        <CardContent>{children}</CardContent>
      </MessageCard>
    </Box>
  );
};

class Group extends Component {
  state = {
    text: '',
    file: false,
    data: [],
    users: {},
    avatars: {},
    profileIdOpen: null,
    errorMsg: '',
    hasMore: true
  };

  componentDidMount() {
    const initialSnapshotLimit = 20;

    const {
      api,
      authstate,
      match: {
        params: { gid }
      }
    } = this.props;

    this.listener = api
      .refGroupMessages(gid)
      .orderBy('createdAt', 'desc')
      .limit(initialSnapshotLimit)
      .onSnapshot(
        snapshots => {
          snapshots.docChanges().forEach(snapshot => {
            !snapshots.metadata.hasPendingWrites &&
              this.setState(state => {
                const snapshotData = snapshot.doc.data();
                if (
                  snapshotData.from !== authstate.uid &&
                  !(snapshotData.from in state.users)
                ) {
                  this.handleNewUser(snapshotData.from);
                }

                const dataUpdate =
                  snapshot.type === 'added'
                    ? [snapshotData, ...state.data]
                    : [...state.data, snapshotData];
                return { data: dataUpdate };
              });
          });
          this.setState({
            hasMore: Boolean(snapshots.docs.length >= initialSnapshotLimit)
          });
        },
        error => {
          this.setState({ errorMsg: error.message });
        }
      );
  }

  fetchOldMessages = () => {
    const snapshotLimit = 20;

    const orderBy = 'createdAt';

    const {
      api,
      match: {
        params: { gid }
      },
      authstate
    } = this.props;
    const { data, hasMore } = this.state;

    if (!hasMore || this.isFetching) return false;
    this.isFetching = true;

    api
      .refGroupMessages(gid)
      .orderBy(orderBy, 'desc')
      .startAfter(data[0][orderBy])
      .limit(snapshotLimit)
      .get()
      .then(snapshots => {
        snapshots.docChanges().forEach(snapshot => {
          this.setState(state => {
            const snapshotData = snapshot.doc.data();
            if (
              snapshotData.from !== authstate.uid &&
              !(snapshotData.from in state.users)
            ) {
              this.handleNewUser(snapshotData.from);
            }

            return {
              data: [snapshotData, ...state.data]
            };
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

  componentWillUnmount() {
    this.listener();
  }

  onSubmit = event => {
    event.preventDefault();
    const { text, file } = this.state;
    const {
      authstate,
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    if (!file && text.trim() === '') {
      return;
    }

    api
      .refGroupMessages(gid)
      .add({
        from: authstate.uid,
        createdAt: api.firebase.firestore.FieldValue.serverTimestamp(),
        text,
        file
      })
      .then(_doc => this.setState({ text: '', file: false }))
      .catch(error => this.setState({ errorMsg: error.message }));
  };

  handleKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      this.onSubmit(event);
    }
  };

  handleNewUser = uid => {
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
      });
  };

  handleProfileIdOpen = profileIdOpen => () => {
    this.setState({ profileIdOpen });
  };

  handleProfileIdClose = () => {
    this.setState({ profileIdOpen: null });
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      text,
      data,
      users,
      avatars,
      profileIdOpen,
      errorMsg,
      hasMore
    } = this.state;
    const {
      authstate,
      match: {
        params: { gid }
      },
      api
    } = this.props;

    return (
      <>
        <TopBar>
          <Box flexGrow="1" />
          <IconButton
            component={Link}
            to={ROUTES.GROUPS_ID_MEMBERS.replace(':gid', gid)}
          >
            <Person />
          </IconButton>
          <IconButton
            component={Link}
            to={ROUTES.GROUPS_ID_DETAILS.replace(':gid', gid)}
          >
            <Description />
          </IconButton>

          <VertDivider />

          <IconButton
            component={Link}
            to={ROUTES.GROUPS_ID_APPLICATIONS.replace(':gid', gid)}
          >
            <FolderShared />
          </IconButton>
        </TopBar>

        <MessageContainer>
          <InfiniteScroll
            style={{
              display: 'flex',
              flexDirection: 'column'
            }}
            initialLoad={false}
            isReverse={true}
            loadMore={this.fetchOldMessages}
            hasMore={hasMore}
            useWindow={false}
            loader={
              <Box width="100%" textAlign="center" my={2} key={0}>
                <CircularProgress />
              </Box>
            }
          >
            {data.map((messageData, index) => {
              const left = messageData.from !== authstate.uid;
              const name = users[messageData.from]
                ? users[messageData.from].name
                : '';
              return (
                <Message
                  key={`message ${index}`}
                  uid={messageData.from}
                  left={left}
                  handleProfileIdOpen={this.handleProfileIdOpen}
                  name={name}
                  avatarUrl={avatars[messageData.from]}
                >
                  {messageData.text}
                </Message>
              );
            })}
          </InfiniteScroll>
        </MessageContainer>

        {errorMsg !== '' && errorMsg}

        <form onSubmit={this.onSubmit}>
          <InputContainer>
            <MessageInput
              onKeyDown={this.handleKeyDown}
              value={text}
              onChange={this.onChange}
              name="text"
              placeholder="Type something"
              inputProps={{ 'aria-label': 'input message' }}
              multiline
              rowsMax="3"
            />
            <IconButton component="button" type="submit">
              <Send />
            </IconButton>
          </InputContainer>
        </form>
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
// input in bottom

export default withRouter(withFirebase(Group));
