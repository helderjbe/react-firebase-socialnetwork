import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Button } from '@material-ui/core';

class Applications extends Component {
  state = { data: [] };
  componentDidMount() {
    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    api
      .refApplicationsByGroupId(gid)
      .orderBy('createdAt', 'desc')
      .limit(8)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          api
            .refUserPublicById(doc.id)
            .get()
            .then(docUser => {
              this.setState(prevState => ({
                data: [
                  ...prevState.data,
                  { ...doc.data(), user: docUser.data(), uid: doc.id }
                ]
              }));
            })
            .catch(error => {
              this.setState({ errorMsg: error.message });
            });
        });
      })
      .catch(error => {
        this.setState({ errorMsg: error.message });
      });
  }

  onAccept = uid => () => {
    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    api
      .refApplicationsByUserId(gid, uid)
      .update({ accepted: true })
      .then(() => {
        api.refApplicationsByUserId(gid, uid).delete();
      })
      .then(() => {
        console.log('done');
      })
      .catch(error => {
        console.error(error.message);
      });
  };

  render() {
    const { data } = this.state;
    console.log(this.state);

    return (
      <div>
        {data.map((entry, index) => {
          if (!entry.user) {
            return 'loading,brah';
          }
          return (
            <ExpansionPanel key={`panel ${index}`}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{entry.user.name}</Typography>
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
                    <Button>User Details</Button>
                  </Box>
                  <Button variant="contained" onClick={this.onDecline}>
                    Decline
                  </Button>
                  <Button
                    variant="contained"
                    onClick={this.onAccept(entry.uid)}
                    color="primary"
                  >
                    Accept
                  </Button>
                </Box>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          );
        })}
      </div>
    );
  }
}

export default withRouter(withFirebase(Applications));
