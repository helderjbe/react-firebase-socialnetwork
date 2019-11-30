import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withSnackbar } from '../../../components/Snackbar';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

const ApplicationDialog = ({
  questions,
  api,
  gid,
  uid,
  handleApplicationDialogClose,
  callSnackbar,
  title,
  applicationDialog
}) => {
  const INITIAL_STATE = { answers: [], loading: false };
  if (questions) {
    for (let i = 0; i < Object.keys(questions).length; i++) {
      if (questions[i].trim() !== '') {
        INITIAL_STATE.answers[questions[i]] = '';
      }
    }
  }

  const [answers, setAnswers] = useState(INITIAL_STATE.answers);
  const [loading, setLoading] = useState(INITIAL_STATE.loading);

  const onSubmit = async event => {
    event.preventDefault();

    setLoading(true);

    const applicationDoc = await api.refGroupApplicationById(gid, uid).get();
    if (applicationDoc.exists) {
      setLoading(false);
      return callSnackbar("You've already applied to this group", 'error');
    }

    try {
      await api.refGroupApplicationById(gid, uid).set({
        application: {
          ...answers
        },
        createdAt: api.firebase.firestore.Timestamp.now().toMillis()
      });

      callSnackbar('Application sent', 'success');
      setAnswers(INITIAL_STATE.answers);
      setLoading(INITIAL_STATE.loading);

      handleApplicationDialogClose();
    } catch (error) {
      setLoading(false);
      callSnackbar(error.message, 'error');
    }
  };

  const onChange = event =>
    setAnswers({ ...answers, [event.target.name]: event.target.value });

  return (
    <Dialog
      open={applicationDialog}
      onClose={handleApplicationDialogClose}
      aria-labelledby="application"
      scroll="body"
    >
      <form onSubmit={onSubmit}>
        <DialogTitle id="application">Applying to "{title}"</DialogTitle>
        <DialogContent>
          <Typography color="primary" paragraph>
            {Object.keys(answers).every(key => key.length <= 0)
              ? 'This group does not require further info. Do you wish to apply?'
              : 'The admin(s) of this group require you to answer the following questions'}
          </Typography>
          {Object.keys(answers).map(
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
                    value={answers[question]}
                    onChange={onChange}
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
};

ApplicationDialog.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.string),
  api: PropTypes.object.isRequired,
  gid: PropTypes.string.isRequired,
  uid: PropTypes.string,
  handleApplicationDialogClose: PropTypes.func.isRequired,
  callSnackbar: PropTypes.func.isRequired,
  title: PropTypes.string,
  applicationDialog: PropTypes.bool
};

export default withSnackbar(ApplicationDialog);
