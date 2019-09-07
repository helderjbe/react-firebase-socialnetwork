import React, { Component } from 'react';

import { withSnackbar } from '../Snackbar';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

class ApplicationDialog extends Component {
  constructor(props) {
    super(props);

    const { questions } = props;

    this.INITIAL_STATE = { questions: {}, loading: false };

    if (questions) {
      for (let i = 0; i < Object.keys(questions).length; i++) {
        if (questions[i].trim() !== '') {
          this.INITIAL_STATE.questions[questions[i]] = '';
        }
      }
    }

    this.state = { ...this.INITIAL_STATE };
  }

  onSubmit = async event => {
    event.preventDefault();

    const {
      api,
      gid,
      uid,
      handleApplicationDialogClose,
      callSnackbar
    } = this.props;
    const { questions } = this.state;

    await this.setState({ loading: true });

    try {
      await api.refGroupApplicationById(gid, uid).set({
        application: {
          ...questions
        },
        createdAt: api.firebase.firestore.Timestamp.now().toMillis()
      });

      callSnackbar('Application sent', 'success');
      this.setState({ ...this.INITIAL_STATE });

      handleApplicationDialogClose();
    } catch (error) {
      this.setState({ loading: false });
      callSnackbar(error.message, 'error');
    }
  };

  onChange = event => {
    const { questions } = this.state;
    this.setState({
      questions: { ...questions, [event.target.name]: event.target.value }
    });
  };

  render() {
    const {
      applicationDialog,
      handleApplicationDialogClose,
      title
    } = this.props;
    const { questions, loading } = this.state;

    return (
      <Dialog
        open={applicationDialog}
        onClose={handleApplicationDialogClose}
        aria-labelledby="application"
        scroll="body"
      >
        <form onSubmit={this.onSubmit}>
          <DialogTitle id="application">Applying to "{title}"</DialogTitle>
          <DialogContent>
            <Typography color="primary" paragraph>
              {Object.keys(questions).every(key => key.length <= 0)
                ? 'This group does not require further info. Do you wish to apply?'
                : 'The admin(s) of this group require you to answer the following questions'}
            </Typography>
            {Object.keys(questions).map(
              (question, index) =>
                question &&
                question !== '' && (
                  <div key={`question ${index}`} style={{ margin: '8px 0' }}>
                    {question}
                    <TextField
                      variant="outlined"
                      margin="normal"
                      multiline
                      rows="4"
                      fullWidth
                      name={question}
                      value={questions[question]}
                      onChange={this.onChange}
                    />
                  </div>
                )
            )}
          </DialogContent>
          <DialogActions>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Apply
            </Button>
            <Button
              onClick={handleApplicationDialogClose}
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogActions>
          {loading && <LinearProgress />}
        </form>
      </Dialog>
    );
  }
}

export default withSnackbar(ApplicationDialog);
