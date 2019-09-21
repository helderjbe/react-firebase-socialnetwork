import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectStateResults
} from 'react-instantsearch-dom';
import { ENV_PREFIX, SEARCH_CONFIG } from '../../config';

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

const HomePage = ({ callSnackbar, hasMore, refine, hits }) => {
  let isFetching = false;

  const onSentinelIntersection = async () => {
    if (!hasMore || isFetching) return false;
    isFetching = true;

    try {
      await refine();
      isFetching = false;
    } catch (error) {
      callSnackbar(error.message, 'error');
    }
  };

  return (
    <Grid
      component={InfiniteScroll}
      container
      spacing={2}
      initialLoad={false}
      loadMore={onSentinelIntersection}
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
};

HomePage.propTypes = {
  hits: PropTypes.array.isRequired
};

const HomePageConnectors = withFirebase(
  withSnackbar(connectInfiniteHits(HomePage))
);

const HomePageWrapper = () => (
  <InstantSearch
    indexName={ENV_PREFIX + process.env.REACT_APP_ALGOLIA_INDEX_NAME}
    searchClient={algoliasearch(SEARCH_CONFIG.appId, SEARCH_CONFIG.searchKey)}
  >
    <HomePageConnectors />
    <Configure hitsPerPage={9} />
  </InstantSearch>
);

export default HomePageWrapper;
