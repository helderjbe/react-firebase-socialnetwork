import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

class ApplicationDialog extends Component {
  constructor(props) {
    super(props);

    const { questions } = props;

    this.INITIAL_STATE = { questions: {}, error: null };

    for (let i = 0; i < Object.keys(questions).length; i++) {
      this.INITIAL_STATE.questions[questions[i]] = '';
    }

    this.state = { ...this.INITIAL_STATE };
  }

  onSubmit = event => {
    event.preventDefault();

    const { api, gid, uid } = this.props;

    api
      .refApplicationsByUserId(gid, uid)
      .set({
        ...this.state.questions,
        createdAt: api.firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        this.setState({ ...this.INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  onChange = event => {
    const { questions } = this.state;
    this.setState({
      questions: { ...questions, [event.target.name]: event.target.value }
    });
  };

  render() {
    const { applicationDialog, handleApplicationDialogClose } = this.props;
    const { questions, error } = this.state;

    const isInvalid = Object.values(questions).some(
      value => value.trim().length <= 0
    );

    return (
      <Dialog
        open={applicationDialog}
        onClose={handleApplicationDialogClose}
        aria-labelledby="application"
        scroll="body"
      >
        <form onSubmit={this.onSubmit}>
          <DialogTitle id="application">Application</DialogTitle>
          <DialogContent>
            <Typography color="primary" paragraph>
              The admin(s) of this group require you to answer the following
              questions
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
              disabled={isInvalid}
              variant="contained"
              color="primary"
            >
              Apply
            </Button>
            <Button
              onClick={handleApplicationDialogClose}
              variant="contained"
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
          <Typography color="error" variant="body2">
            {error && error.message}
          </Typography>
        </form>
      </Dialog>
    );
  }
}

export default ApplicationDialog;
