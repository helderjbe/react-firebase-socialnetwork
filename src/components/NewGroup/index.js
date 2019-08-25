import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import ChipInput from 'material-ui-chip-input';

import * as ROUTES from '../../constants/routes';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

class NewGroup extends Component {
  state = {
    title: '',
    limit: 0,
    tags: [],
    loading: false,

    error: null
  };

  onSubmit = event => {
    event.preventDefault();

    const { title, limit, tags } = this.state;
    const { api, authstate, history } = this.props;

    this.setState({ loading: true });

    console.log('loading...');

    api
      .refGroups()
      .add({
        title,
        limit: Number(limit) === 1 ? 2 : Number(limit),
        tags,
        founder: authstate.uid,
        createdAt: api.firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(doc => {
        this.cancelListener = api.refGroupById(doc.id).onSnapshot(
          async snapshot => {
            if (snapshot.data().memberCount) {
              await api.doAuthStateReload();
              this.cancelListener();
              return history.push(
                ROUTES.GROUPS_ID_EDIT.replace(':gid', doc.id)
              );
            }
          },
          error => {
            this.setState({ error, loading: false });
          }
        );
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onTagBeforeAdd = chip => {
    const { tags } = this.state;
    return chip.length >= 3 && chip.length <= 20 && tags.length <= 10;
  };

  onTagAdd = chip => {
    const { tags } = this.state;
    this.setState({
      tags: [...tags, chip]
    });
  };

  onTagDelete = deletedChip => {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter(c => c !== deletedChip)
    });
  };

  render() {
    const { title, limit, tags, error, loading } = this.state;

    const isInvalid = title.length < 6 || loading;

    return (
      <form autoComplete="off" onSubmit={this.onSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          label="Title"
          name="title"
          placeholder="Freelance accountability group ..."
          required
          value={title}
          inputProps={{ maxLength: '54' }}
          onChange={this.onChange}
        />
        <ChipInput
          fullWidth
          label="Tags"
          value={tags}
          variant="outlined"
          newChipKeyCodes={[13, 9, 188]}
          margin="normal"
          placeholder="Freelance,Beginner,Accountability, ..."
          onBeforeAdd={this.onTagBeforeAdd}
          onAdd={this.onTagAdd}
          onDelete={this.onTagDelete}
        />
        <TextField
          type="number"
          variant="outlined"
          margin="normal"
          fullWidth
          label="Member limit"
          name="limit"
          value={limit}
          onChange={this.onChange}
          inputProps={{ min: 0 }}
          helperText="0 = Unlimited"
        />
        <Button
          type="submit"
          fullWidth
          disabled={isInvalid}
          variant="contained"
          color="primary"
          style={{ marginTop: '8px' }}
        >
          Create
        </Button>
        {loading && <LinearProgress />}
        {error && (
          <Typography color="error" variant="body2">
            {error.message}
          </Typography>
        )}
      </form>
    );
  }
}

export default withRouter(withFirebase(NewGroup));
