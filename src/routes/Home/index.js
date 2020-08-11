import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
} from 'react-instantsearch-dom';
import { SEARCH_CONFIG } from '../../config';

import InfiniteScroll from 'react-infinite-scroller';

import { withSnackbar } from '../../components/Snackbar';
import { withUserSession } from '../../components/Session';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';

import SearchContent from './SearchContent';
import GroupCard from './GroupCard';

const CreateGroupLink = () => (
  <Grid
    item
    xs={12}
    component={Link}
    to={ROUTES.GROUPS_NEW}
    style={{ textDecoration: 'none' }}
  >
    <Card elevation={2}>
      <CardContent>
        <Box textAlign="center" my={1}>
          <Typography variant="caption" color="textSecondary">
            Don't find what you're looking for?
          </Typography>
          <Typography variant="h5">Create a new Group</Typography>
        </Box>
      </CardContent>
    </Card>
  </Grid>
);

let isFetching = false;

const HomePage = ({ callSnackbar, hasMore, refine, hits, authstate }) => {
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
      {hits.length <= 0 && <CreateGroupLink />}
      {hits.map((hit) => (
        <Grid item xs={12} sm={authstate ? 12 : 6} key={hit.objectID}>
          <Card elevation={2}>
            <GroupCard {...hit} gid={hit.objectID} />
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

HomePage.propTypes = {
  callSnackbar: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  refine: PropTypes.func,
  hits: PropTypes.array,
};

const HomePageConnectors = withUserSession(
  withSnackbar(connectInfiniteHits(HomePage))
);

const HomePageWrapper = () => (
  <InstantSearch
    indexName={process.env.REACT_APP_ALGOLIA_INDEX_NAME}
    searchClient={algoliasearch(SEARCH_CONFIG.appId, SEARCH_CONFIG.searchKey)}
  >
    <HomePageConnectors />
    <Configure hitsPerPage={9} />
  </InstantSearch>
);

export default HomePageWrapper;
