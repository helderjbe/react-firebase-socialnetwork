import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';

import ChipInput from 'material-ui-chip-input';

import * as ROUTES from '../../constants/routes';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

class NewGroup extends Component {
  state = {
    title: '',
    memberLimit: 2,
    tags: [],
    loading: false,
    tagValidation: ''
  };

  onSubmit = async event => {
    event.preventDefault();

    const { title, memberLimit, tags } = this.state;
    const { api, authstate, history, callSnackbar } = this.props;

    this.setState({ loading: true });

    try {
      const doc = await api.refGroups().add({
        title,
        tags,
        memberLimit: Number(memberLimit),
        founder: authstate.uid,
        createdAt: api.firebase.firestore.Timestamp.now().toMillis()
      });

      callSnackbar(
        'Group successfully created, you can now edit the details.',
        'success'
      );
      history.push(ROUTES.GROUPS_ID_EDIT.replace(':gid', doc.id));
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onTagUpdateInput = event => {
    const string = event.target.value.match(/[^0-9a-z]/i);
    if (string && string.length) {
      const replacedString = event.target.value.replace(/[^0-9a-z]/gi, '');
      if (this.onTagBeforeAdd(replacedString)) {
        this.onTagAdd(replacedString);
      }
    }
  };

  onTagBeforeAdd = chip => {
    const { tags, tagValidation } = this.state;

    if (chip.length < 3) {
      this.setState({ tagValidation: 'Tag must 3 chars long or more' });
      return false;
    } else if (chip.length > 20) {
      this.setState({ tagValidation: 'Tag must 20 chars long or less' });
      return false;
    } else if (tags.length >= 10) {
      this.setState({ tagValidation: 'A group cannot have more than 10 tags' });
      return false;
    } else if (tagValidation !== '') {
      this.setState({ tagValidation: '' });
    }

    return true;
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
    const { title, memberLimit, tags, loading, tagValidation } = this.state;

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
        <TextField
          type="number"
          variant="outlined"
          margin="normal"
          fullWidth
          label="Member limit"
          name="memberLimit"
          required
          value={memberLimit}
          onChange={this.onChange}
          helperText="You cannot change this later"
          inputProps={{
            min: 2,
            max: 99
          }}
        />
        {
          <ChipInput
            fullWidth
            label="Tags"
            value={tags}
            variant="outlined"
            margin="normal"
            placeholder="Freelance,Beginner,Accountability, ..."
            onBeforeAdd={this.onTagBeforeAdd}
            onAdd={this.onTagAdd}
            onDelete={this.onTagDelete}
            onUpdateInput={this.onTagUpdateInput}
            error={tagValidation !== ''}
            helperText={tagValidation}
            clearInputValueOnChange
          />
        }
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
      </form>
    );
  }
}

NewGroup.propTypes = {
  api: PropTypes.object.isRequired,
  authstate: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  callSnackbar: PropTypes.func.isRequired
};

export default withRouter(withFirebase(withSnackbar(NewGroup)));
