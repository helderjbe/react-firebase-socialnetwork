import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withProtectedRoute } from '../../components/Session';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import GroupRow from '../../components/GroupRow';
import { CardContent } from '@material-ui/core';

class GroupsPage extends Component {
  state = { data: [], errorMsg: '' };

  componentDidMount() {
    const { api } = this.props;

    api.doGetIdTokenResult().then(token => {
      console.log(token.claims);
      if (!('groups' in token.claims)) {
        return false;
      }
      const groupIds = Object.keys(token.claims.groups);

      groupIds.forEach(gid => {
        api
          .refGroupPublicById(gid)
          .get()
          .then(doc => {
            this.setState(prevState => ({
              data: [...prevState.data, { ...doc.data(), gid: doc.id }]
            }));
          })
          .catch(error => {
            this.setState({ errorMsg: error.message });
          });
      });
    });
  }

  render() {
    const { data, errorMsg } = this.state;
    console.log(this.state);

    return (
      <Grid container spacing={1}>
        {data.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>No groups under your belt yet</CardContent>
            </Card>
          </Grid>
        )}
        {errorMsg === ''
          ? data.map((entry, index) => (
              <Grid item xs={12} key={`grouprow ${index}`}>
                <Card>
                  <GroupRow {...entry} />
                </Card>
              </Grid>
            ))
          : errorMsg}
      </Grid>
    );
  }
}

GroupsPage.propTypes = {
  api: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(GroupsPage);
