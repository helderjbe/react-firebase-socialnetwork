import React, { Component } from 'react';
import PropTypes from 'prop-types';

import makeCancelable from 'makecancelable';

import InfiniteScroll from 'react-infinite-scroller';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { withFirebase } from '../../components/Firebase';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

import CreateGroupLink from '../../components/CreateGroupLink';
import GroupCard from '../../components/GroupCard';

class HomePage extends Component {
  state = { data: [], errorMsg: '', hasMore: true };

  componentDidMount() {
    this.fetchGroups();
  }

  componentWillUnmount() {
    if (this.cancelRequest) {
      this.cancelRequest();
    }
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

    this.cancelRequest = makeCancelable(
      query.get(),
      snapshots => {
        snapshots.docs.forEach(snapshot => {
          this.setState(state => ({
            data: [...state.data, { ...snapshot.data(), gid: snapshot.id }]
          }));
        });

        if (snapshots.docs.length < snapshotLimit)
          return this.setState({ hasMore: false });

        this.isFetching = false;
      },
      error => this.setState({ errorMsg: error.message })
    );
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
  api: PropTypes.object.isRequired
};

export default withFirebase(HomePage);
