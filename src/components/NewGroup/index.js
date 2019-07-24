import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import ChipInput from 'material-ui-chip-input';

import * as ROUTES from '../../constants/routes';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

class NewGroup extends Component {
  state = {
    title: '',
    limit: 2,
    tags: [],

    error: null
  };

  onSubmit = event => {
    event.preventDefault();

    const { title, limit, tags } = this.state;
    const { api, authstate, history } = this.props;

    const batch = api.firestore.batch();
    const newDocId = api.refGroupPublicGenId();

    batch.set(api.refGroupPublicById(newDocId), {
      title,
      limit: Number(limit),
      tags,
      memberCount: 1,
      createdAt: api.firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: api.firebase.firestore.FieldValue.serverTimestamp()
    });

    batch.set(api.refGroupPrivateById(newDocId), {
      admins: [authstate.uid]
    });

    batch
      .commit()
      .then(() => {
        history.push(`${ROUTES.GROUPS}/${newDocId}/edit`);
      })
      .catch(error => {
        this.setState({ error });
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
    const { title, limit, tags, error } = this.state;

    const isInvalid = title.length < 6;

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
          inputProps={{ maxLength: '56' }}
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
          type="number" //TODO: needs to be > 2
          variant="outlined"
          margin="normal"
          fullWidth
          label="Member limit"
          name="limit"
          value={limit}
          onChange={this.onChange}
          inputProps={{ min: '2' }}
          helperText="Leave blank for no limit"
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
        <Typography color="error" variant="body2">
          {error && error.message}
        </Typography>
      </form>
    );
  }
}

export default withRouter(withFirebase(NewGroup));
