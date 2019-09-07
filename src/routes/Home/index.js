import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import {
  connectInfiniteHits,
  connectStateResults
} from 'react-instantsearch-dom';

import InfiniteScroll from 'react-infinite-scroller';

import { withFirebase } from '../../components/Firebase';
import { withSnackbar } from '../../components/Snackbar';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';

import SearchContent from './SearchContent';
import GroupCard from '../../components/GroupCard';

const NoResultsCard = connectStateResults(
  ({ isSearchStalled, show }) =>
    show &&
    !isSearchStalled && (
      <Grid
        item
        xs={12}
        component={Link}
        to={ROUTES.GROUPS_NEW}
        style={{ textDecoration: 'none' }}
      >
        <Card>
          <CardContent>
            <Box textAlign="center" my={1}>
              <Typography variant="caption" color="textSecondary">
                No groups were found based on that criteria
              </Typography>
              <Typography variant="h5">Create a new Group</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    )
);

class HomePage extends Component {
  onSentinelIntersection = async () => {
    const { callSnackbar, hasMore, refine } = this.props;

    if (!hasMore || this.isFetching) return false;
    this.isFetching = true;

    try {
      await refine();
      this.isFetching = false;
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  render() {
    const { hits, hasMore } = this.props;
    return (
      <Grid
        component={InfiniteScroll}
        container
        spacing={2}
        initialLoad={false}
        loadMore={this.onSentinelIntersection}
        hasMore={hasMore}
        loader={
          <Box width="100%" textAlign="center" my={2} key={0}>
            <CircularProgress />
          </Box>
        }
      >
        <SearchContent />
        <NoResultsCard show={!hits.length} />
        {hits.map(hit => (
          <Grid item xs={12} key={hit.objectID}>
            <Card>
              <GroupCard {...hit} gid={hit.objectID} />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
}

HomePage.propTypes = {
  hits: PropTypes.array.isRequired
};

export default withFirebase(withSnackbar(connectInfiniteHits(HomePage)));
