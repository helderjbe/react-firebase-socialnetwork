import React, { Component } from 'react';
import PropTypes from 'prop-types';

import InfiniteScroll from 'react-infinite-scroller';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { withFirebase } from '../../components/Firebase';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography, Box } from '@material-ui/core';

import CreateGroupLink from '../../components/CreateGroupLink';
import GroupCard from '../../components/GroupCard';

class HomePage extends Component {
  state = { data: [], errorMsg: '', hasMore: true };

  componentDidMount() {
    this.fetchGroups();
  }

  fetchGroups = () => {
    const snapshotLimit = 15;

    const orderBy = 'createdAt';

    const { api } = this.props;
    const { data, hasMore } = this.state;

    if (!hasMore || this.isFetching) return false;
    this.isFetching = true;

    const query = data.length
      ? api
          .refGroups()
          .orderBy(orderBy, 'desc')
          .startAfter(data[data.length - 1][orderBy])
          .limit(snapshotLimit)
      : api
          .refGroups()
          .orderBy(orderBy, 'desc')
          .limit(snapshotLimit);

    query
      .get()
      .then(snapshots => {
        snapshots.docs.forEach(snapshot => {
          this.setState(state => ({
            data: [...state.data, { ...snapshot.data(), gid: snapshot.id }]
          }));
        });
        return snapshots.docs.length;
      })
      .then(snapshotLength => {
        if (snapshotLength < snapshotLimit)
          return this.setState({ hasMore: false });
      })
      .then(() => (this.isFetching = false))
      .catch(error => {
        this.setState({ errorMsg: error.message });
      });
  };

  render() {
    const { data, errorMsg, hasMore } = this.state;

    return (
      <Grid
        component={InfiniteScroll}
        container
        spacing={2}
        initialLoad={false}
        loadMore={this.fetchGroups}
        hasMore={hasMore}
        loader={
          <Box width="100%" textAlign="center" my={2} key={0}>
            <CircularProgress />
          </Box>
        }
      >
        <Grid item xs={12}>
          <Link to={ROUTES.GROUPS_NEW} style={{ textDecoration: 'none' }}>
            <Card>
              <CreateGroupLink />
            </Card>
          </Link>
        </Grid>

        {data.map((entry, index) => (
          <Grid item xs={12} key={`group ${index}`}>
            <Card>
              <GroupCard {...entry} />
            </Card>
          </Grid>
        ))}

        {errorMsg !== '' ? errorMsg : null}
      </Grid>
    );
  }
}

HomePage.propTypes = {
  // TODO: Complete all proptypes in all files
  api: PropTypes.object.isRequired
};

export default withFirebase(HomePage);
