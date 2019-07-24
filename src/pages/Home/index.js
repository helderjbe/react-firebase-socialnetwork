import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';

import { withFirebase } from '../../components/Firebase';

import CreateGroupLink from '../../components/CreateGroupLink';
import GroupCard from '../../components/GroupCard';

class HomePage extends Component {
  state = { data: [], errorMsg: '' };

  componentDidMount() {
    const { api } = this.props;

    api
      .refGroupsPublic()
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.setState(prevState => ({
            data: [...prevState.data, { ...doc.data(), id: doc.id }]
          }));
        });
      })
      .catch(error => {
        this.setState({ errorMsg: error.message });
        console.error(`${error.message} Please try again`);
      });
  }

  render() {
    const { data, errorMsg } = this.state;

    return (
      <Grid container spacing={2}>
        <CreateGroupLink />
        {errorMsg === ''
          ? data.map((entry, index) => (
              <GroupCard {...entry} key={`group ${index}`} />
            ))
          : errorMsg}
      </Grid>
    );
  }
}

HomePage.propTypes = {
  api: PropTypes.object.isRequired
};

export default withFirebase(HomePage);
