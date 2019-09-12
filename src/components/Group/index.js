import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { Link, withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

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
            <Avatar alt={name || 'No Name'} src={avatarUrl || defaultAvatar} />
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

Message.propTypes = {
  left: PropTypes.bool,
  uid: PropTypes.string.isRequired,
  handleProfileIdOpen: PropTypes.func.isRequired,
  avatarUrl: PropTypes.string,
  name: PropTypes.string
};

const Group = ({
  authstate,
  match: {
    params: { gid }
  },
  api,
  callSnackbar
}) => {
  const initialSnapshotLimit = 20;

  const [text, setText] = useState('');
  const [file, setFile] = useState(false);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState({});
  const [avatars, setAvatars] = useState({});
  const [profileIdOpen, setProfileIdOpen] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const handleNewUser = useCallback(
    async uid => {
      try {
        const doc = await api.refUserById(uid).get();
        const userData = doc.data();

        if (userData && userData.avatar) {
          const url = await api.refUserAvatar(uid).getDownloadURL();
          setAvatars(prevAvatars => ({ ...prevAvatars, [uid]: url }));
        } else {
          setAvatars(prevAvatars => ({ ...prevAvatars, [uid]: '' }));
        }
        setUsers(prevUsers => ({ ...prevUsers, [doc.id]: userData }));
      } catch (error) {
        callSnackbar(error.message, 'error');
      }
    },
    [api, callSnackbar]
  );

  useEffect(() => {
    const cancelListener = api
      .refGroupMessages(gid)
      .orderBy('createdAt', 'desc')
      .limit(initialSnapshotLimit)
      .onSnapshot(
        snapshots => {
          snapshots.docChanges().forEach(snapshot => {
            const snapshotData = snapshot.doc.data();
            if (
              snapshotData.from !== authstate.uid &&
              !(snapshotData.from in users)
            ) {
              handleNewUser(snapshotData.from);
            }
            setData(prevData =>
              snapshot.newIndex > 0
                ? [snapshotData, ...prevData]
                : [...prevData, snapshotData]
            );
          });
          setHasMore(Boolean(snapshots.docs.length >= initialSnapshotLimit));
        },
        error => {
          callSnackbar(error.message, 'error');
        }
      );

    const checkAdmin = async () => {
      const token = await api.doGetIdTokenResult();

      if (token.claims.groups[gid] === 'admin') {
        setAdmin(true);
      }
    };
    checkAdmin();

    return cancelListener;
  }, [api, authstate.uid, callSnackbar, gid, handleNewUser, users]);

  const fetchOldMessages = async () => {
    const snapshotLimit = 20;

    const orderBy = 'createdAt';

    if (!hasMore || isFetching) return false;
    await setIsFetching(true);

    try {
      const snapshots = await api
        .refGroupMessages(gid)
        .orderBy(orderBy, 'desc')
        .startAfter(data[0][orderBy])
        .limit(snapshotLimit)
        .get();

      snapshots.docChanges().forEach(snapshot => {
        const snapshotData = snapshot.doc.data();
        if (
          snapshotData.from !== authstate.uid &&
          !(snapshotData.from in users)
        ) {
          handleNewUser(snapshotData.from);
        }
        setData(prevData => [snapshotData, ...prevData]);
      });

      if (snapshots.docs.length < snapshotLimit) {
        setHasMore(false);
      }

      setIsFetching(false);
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  const onSubmit = async event => {
    event.preventDefault();

    if (!file && text.trim() === '') {
      return;
    }

    try {
      await api.refGroupMessages(gid).add({
        from: authstate.uid,
        createdAt: api.firebase.firestore.Timestamp.now().toMillis(),
        text,
        file
      });

      setText('');
      setFile(false);
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  const handleKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      onSubmit(event);
    }
  };

  const handleProfileIdOpen = pId => () => setProfileIdOpen(pId);

  const handleProfileIdClose = () => setProfileIdOpen(null);

  const onChangeText = event => setText(event.target.value);

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

        {admin && (
          <>
            <VertDivider />

            <IconButton
              component={Link}
              to={ROUTES.GROUPS_ID_APPLICATIONS.replace(':gid', gid)}
            >
              <FolderShared />
            </IconButton>
          </>
        )}
      </TopBar>

      <MessageContainer>
        <InfiniteScroll
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
          initialLoad={false}
          isReverse={true}
          loadMore={fetchOldMessages}
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
                handleProfileIdOpen={handleProfileIdOpen}
                name={name}
                avatarUrl={avatars[messageData.from]}
              >
                {messageData.text}
              </Message>
            );
          })}
        </InfiniteScroll>
      </MessageContainer>

      <form onSubmit={onSubmit}>
        <InputContainer>
          <MessageInput
            onKeyDown={handleKeyDown}
            value={text}
            onChange={onChangeText}
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
      {profileIdOpen && (
        <UserProfileModal
          handleClose={handleProfileIdClose}
          open={Boolean(profileIdOpen)}
          avatarUrl={avatars[profileIdOpen]}
          name={users[profileIdOpen] && users[profileIdOpen].name}
          about={users[profileIdOpen] && users[profileIdOpen].about}
        />
      )}
    </>
  );
};
/*
class Group extends Component {
  state = {
    text: '',
    file: false,
    data: [],
    users: {},
    avatars: {},
    profileIdOpen: null,
    hasMore: true,
    admin: false
  };

  async componentDidMount() {
    const initialSnapshotLimit = 20;

    const {
      api,
      authstate,
      match: {
        params: { gid }
      },
      callSnackbar
    } = this.props;

    this.listener = api
      .refGroupMessages(gid)
      .orderBy('createdAt', 'desc')
      .limit(initialSnapshotLimit)
      .onSnapshot(
        snapshots => {
          snapshots.docChanges().forEach(snapshot =>
            this.setState(state => {
              const snapshotData = snapshot.doc.data();
              if (
                snapshotData.from !== authstate.uid &&
                !(snapshotData.from in state.users)
              ) {
                this.handleNewUser(snapshotData.from);
              }
              return {
                data:
                  snapshot.newIndex > 0
                    ? [snapshotData, ...state.data]
                    : [...state.data, snapshotData]
              };
            })
          );
          this.setState({
            hasMore: Boolean(snapshots.docs.length >= initialSnapshotLimit)
          });
        },
        error => {
          callSnackbar(error.message, 'error');
        }
      );

    const token = await api.doGetIdTokenResult();

    if (token.claims.groups[gid] === 'admin') {
      this.setState({ admin: true });
    }
  }

  fetchOldMessages = async () => {
    const snapshotLimit = 20;

    const orderBy = 'createdAt';

    const {
      api,
      match: {
        params: { gid }
      },
      authstate,
      callSnackbar
    } = this.props;
    const { data, hasMore } = this.state;

    if (!hasMore || this.isFetching) return false;
    this.isFetching = true;

    try {
      const snapshots = await api
        .refGroupMessages(gid)
        .orderBy(orderBy, 'desc')
        .startAfter(data[0][orderBy])
        .limit(snapshotLimit)
        .get();

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

      if (snapshots.docs.length < snapshotLimit) {
        this.setState({ hasMore: false });
      }

      this.isFetching = false;
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  componentWillUnmount() {
    this.listener();
  }

  onSubmit = async event => {
    event.preventDefault();
    const { text, file } = this.state;
    const {
      authstate,
      api,
      match: {
        params: { gid }
      },
      callSnackbar
    } = this.props;

    if (!file && text.trim() === '') {
      return;
    }

    try {
      await api.refGroupMessages(gid).add({
        from: authstate.uid,
        createdAt: api.firebase.firestore.Timestamp.now().toMillis(),
        text,
        file
      });

      this.setState({ text: '', file: false });
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  handleKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      this.onSubmit(event);
    }
  };

  handleNewUser = async uid => {
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
        users: { ...state.users, [doc.id]: userData }
      }));
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
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
      hasMore,
      admin
    } = this.state;
    const {
      authstate,
      match: {
        params: { gid }
      }
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

          {admin && (
            <>
              <VertDivider />

              <IconButton
                component={Link}
                to={ROUTES.GROUPS_ID_APPLICATIONS.replace(':gid', gid)}
              >
                <FolderShared />
              </IconButton>
            </>
          )}
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
        {profileIdOpen && (
          <UserProfileModal
            handleClose={this.handleProfileIdClose}
            open={Boolean(profileIdOpen)}
            avatarUrl={avatars[profileIdOpen]}
            name={users[profileIdOpen] && users[profileIdOpen].name}
            about={users[profileIdOpen] && users[profileIdOpen].about}
          />
        )}
      </>
    );
  }
}*/

Group.propTypes = {
  api: PropTypes.object.isRequired,
  callSnackbar: PropTypes.func.isRequired,
  authstate: PropTypes.object,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired
  })
};

export default withRouter(withFirebase(withSnackbar(Group)));
