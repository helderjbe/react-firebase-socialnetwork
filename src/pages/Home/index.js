import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { withFirebase } from '../../components/Firebase';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';

import CreateGroupLink from '../../components/CreateGroupLink';
import GroupCard from '../../components/GroupCard';

class HomePage extends Component {
  state = { data: [], errorMsg: '' };

  componentDidMount() {
    const { api } = this.props;

    api
      .refGroupsPublic()
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.setState(prevState => ({
            data: [...prevState.data, { ...doc.data(), gid: doc.id }]
          }));
        });
      })
      .catch(error => {
        this.setState({ errorMsg: error.message });
      });
  }

  render() {
    const { data, errorMsg } = this.state;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Link to={ROUTES.GROUPS_NEW} style={{ textDecoration: 'none' }}>
            <Card>
              <CreateGroupLink />
            </Card>
          </Link>
        </Grid>
        {errorMsg === ''
          ? data.map((entry, index) => (
              <Grid item xs={12} key={`group ${index}`}>
                <Card>
                  <GroupCard {...entry} />
                </Card>
              </Grid>
            ))
          : errorMsg}
      </Grid>
    );
  }
}

HomePage.propTypes = {
  // TODO: Complete all proptypes in all files
  api: PropTypes.object.isRequired
};

export default withFirebase(HomePage);
