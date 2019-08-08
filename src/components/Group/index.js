import React, { Component } from 'react';

import { Link, withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

import { withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';

import Image from '@material-ui/icons/Image';
import Send from '@material-ui/icons/Send';
import Person from '@material-ui/icons/Person';
import Description from '@material-ui/icons/Description';
import Settings from '@material-ui/icons/Settings';
import FolderShared from '@material-ui/icons/FolderShared';
import Close from '@material-ui/icons/Close';
import { styled, useTheme } from '@material-ui/core/styles';

import UserProfileModal from '../UserProfileModal';
import LeaveDialog from './leaveGroup';

import defaultAvatar from '../../common/images/defaultAvatar.png';

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
    leaveDialogOpen: false
  };

  componentDidMount() {
    const {
      api,
      authstate,
      match: {
        params: { gid }
      }
    } = this.props;

    this.listener = api
      .refGroupMessagesByGroupId(gid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .onSnapshot(snapshots =>
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
                  ? [...state.data, snapshotData]
                  : [snapshotData, ...state.data];
              return { data: dataUpdate };
            });
        })
      );
  }

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
      .refGroupMessagesByGroupId(gid)
      .add({
        from: authstate.uid,
        createdAt: api.firebase.firestore.FieldValue.serverTimestamp(),
        text,
        file
      })
      .then(_doc => this.setState({ text: '', file: false }))
      .catch(console.error);
  };

  handleKeyDown = event => {
    if (event.keyCode === 13 && !event.shiftKey) {
      this.onSubmit(event);
    }
  };

  handleNewUser = uid => {
    const { api } = this.props;

    api
      .refUserPublicById(uid)
      .get()
      .then(doc => {
        const userData = doc.data();
        if (userData.avatar) {
          api
            .refUserPublicAvatar(uid)
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

  handleLeaveDialog = () => {
    this.setState(state => ({ leaveDialogOpen: !state.leaveDialogOpen }));
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
      leaveDialogOpen
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
          <IconButton onClick={this.handleLeaveDialog}>
            <Close />
          </IconButton>

          <VertDivider />

          <IconButton
            component={Link}
            to={ROUTES.GROUPS_ID_APPLICATIONS.replace(':gid', gid)}
          >
            <FolderShared />
          </IconButton>
          <IconButton
            component={Link}
            to={ROUTES.GROUPS_ID_EDIT.replace(':gid', gid)}
          >
            <Settings />
          </IconButton>
        </TopBar>

        <MessageContainer>
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
        </MessageContainer>

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
            bio={users[profileIdOpen].bio}
            location={users[profileIdOpen].location}
            contact={users[profileIdOpen].contact}
          />
        )}
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
// input in bottom

export default withRouter(withFirebase(Group));
