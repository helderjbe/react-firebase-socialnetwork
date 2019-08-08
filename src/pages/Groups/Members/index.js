import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';

import { withProtectedRoute } from '../../../components/Session';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import MemberRow from '../../../components/MemberRow';
import { CardContent } from '@material-ui/core';

class MembersGroupPage extends Component {
  state = { errorMsg: '', admins: [], members: [], profileIdOpen: null };

  componentDidMount() {
    const {
      api,
      match: {
        params: { gid }
      }
    } = this.props;

    api
      .refGroupPrivateById(gid)
      .get()
      .then(doc => {
        this.admins = doc.data().admins;
        this.members = doc.data().members;

        this.onRequestUserList(6);
      })
      .catch(error => console.log(error.message));
  }

  onRequestUserList = async amount => {
    const { api } = this.props;

    for (let i = 0; i < amount; amount++) {
      if (this.admins && this.admins.length) {
        await api
          .refUserPublicById(this.admins.shift())
          .get()
          .then(doc => {
            this.setState(state => ({
              admins: [...state.admins, { data: doc.data(), uid: doc.id }]
            }));
          });
        continue;
      }
      if (this.members && this.members.length) {
        await api
          .refUserPublicById(this.members.shift())
          .get()
          .then(doc => {
            this.setState(state => ({
              members: [...state.members, { data: doc.data(), uid: doc.id }]
            }));
          });
        continue;
      }
      break;
    }
  };

  render() {
    const { errorMsg, admins, members } = this.state;

    return (
      <>
        <Grid container spacing={1}>
          {admins.length === 0 && members.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>No other members yet</CardContent>
              </Card>
            </Grid>
          )}
          {errorMsg === ''
            ? admins.map((entry, index) => (
                <Grid item xs={12} key={`memberrow admin ${index}`}>
                  <Card>
                    <MemberRow {...entry} />
                  </Card>
                </Grid>
              ))
            : errorMsg}
          {errorMsg === ''
            ? members.map((entry, index) => (
                <Grid item xs={12} key={`memberrow member ${index}`}>
                  <Card>
                    <MemberRow {...entry} />
                  </Card>
                </Grid>
              ))
            : null}
        </Grid>
      </>
    );
  }
}

MembersGroupPage.propTypes = {
  api: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(withRouter(MembersGroupPage));
