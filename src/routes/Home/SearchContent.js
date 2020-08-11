import React from 'react';
import PropTypes from 'prop-types';

import {
  connectSearchBox,
  connectStateResults,
  connectRange,
  connectRefinementList,
  Highlight,
} from 'react-instantsearch-dom';

import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import { fade, withStyles, styled } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';

import Search from '@material-ui/icons/Search';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import { CardContent, Box, Typography, Tooltip } from '@material-ui/core';

import algoliaLogo from './algolia-logo.svg';

const SearchIcon = styled('div')(({ theme }) => ({
  width: theme.spacing(7),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const SearchContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: fade(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: fade(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const Input = withStyles((theme) => ({
  root: {
    color: 'inherit',
  },
  input: {
    padding: theme.spacing(1, 1, 1, 7),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
}))(InputBase);

const TagsCheckbox = withStyles((theme) => ({
  label: { ...theme.typography.body2 },
}))(FormControlLabel);

const MemberCountInput = withStyles((theme) => ({
  root: {
    width: theme.spacing(5),
  },
}))(TextField);

const LoadingIndicator = connectStateResults(({ isSearchStalled }) =>
  isSearchStalled ? (
    <CircularProgress color="primary" size={20} />
  ) : (
    <Search color="primary" />
  )
);

LoadingIndicator.propTypes = {
  isSearchStalled: PropTypes.bool,
};

const SearchInput = connectSearchBox(({ refine, currentRefinement }) => (
  <Input
    placeholder="Search Groups…"
    value={currentRefinement}
    onChange={(event) => refine(event.currentTarget.value)}
    inputProps={{ 'aria-label': 'Search' }}
    style={{ flexGrow: 1 }}
  />
));

SearchInput.propTypes = {
  refine: PropTypes.func,
  currentRefinement: PropTypes.string,
};

const MemberCountSlider = connectRange(
  ({ refine, currentRefinement, min, max }) => (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <MemberCountInput
            type="number"
            value={currentRefinement.min || 0}
            margin="dense"
            onChange={(event) =>
              refine({
                ...currentRefinement,
                min:
                  event.currentTarget.value < min
                    ? min
                    : event.currentTarget.value,
              })
            }
            inputProps={{
              step: 1,
              min,
              max,
            }}
          />
        </Grid>
        <Grid item xs>
          <Slider
            min={min || 0}
            max={max || 0}
            value={[currentRefinement.min, currentRefinement.max]}
            onChange={(_event, newValue) =>
              refine({
                min: newValue[0] < min ? min : newValue[0],
                max: newValue[1] > max ? max : newValue[1],
              })
            }
            valueLabelDisplay="auto"
            aria-labelledby="Filter by number of members"
          />
        </Grid>
        <Grid item>
          <MemberCountInput
            type="number"
            value={currentRefinement.max || 0}
            margin="dense"
            onChange={(event) =>
              refine({
                ...currentRefinement,
                max:
                  event.currentTarget.value > max
                    ? max
                    : event.currentTarget.value,
              })
            }
            inputProps={{
              step: 1,
              min,
              max,
            }}
          />
        </Grid>
      </Grid>
    </>
  )
);

MemberCountSlider.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  refine: PropTypes.func,
  currentRefinement: PropTypes.string,
};

const Tags = connectRefinementList(
  ({ items, isFromSearch, refine, searchForItems }) => (
    <>
      <Grid container spacing={0}>
        {items.map((item, index) => (
          <Grid item xs={6} key={index + item.label}>
            <TagsCheckbox
              control={
                <Checkbox
                  size="small"
                  color="primary"
                  checked={item.isRefined}
                  onChange={() => refine(item.value)}
                />
              }
              label={
                isFromSearch ? (
                  <>
                    <Highlight attribute="label" hit={item} />
                    {` (${item.count})`}
                  </>
                ) : (
                  item.label + ` (${item.count})`
                )
              }
            />
          </Grid>
        ))}
      </Grid>
      <TextField
        type="search"
        label="Search Tags..."
        margin="dense"
        fullWidth
        variant="outlined"
        onChange={(event) => searchForItems(event.currentTarget.value)}
      />
    </>
  )
);

Tags.propTypes = {
  items: PropTypes.array,
  isFromSearch: PropTypes.bool,
  searchForItems: PropTypes.func,
  refine: PropTypes.func,
};

const SearchContent = () => {
  const [expanded, setExpanded] = React.useState(false);

  function handleExpandClick() {
    setExpanded(!expanded);
  }

  return (
    <Box mb={2}>
      <Card elevation={2}>
        <SearchContainer>
          <SearchIcon>
            <LoadingIndicator />
          </SearchIcon>
          <SearchInput />
          <Tooltip title="Create Group">
            <IconButton component={Link} to={ROUTES.GROUPS_NEW}>
              <AddCircleOutline />
            </IconButton>
          </Tooltip>
          <Tooltip title="Show filters">
            <IconButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show filters"
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </SearchContainer>
      </Card>
      <Box mt={1}>
        <Collapse
          component={Grid}
          item
          in={expanded}
          timeout="auto"
          style={{ width: '100%' }}
          unmountOnExit
        >
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2">Filter by tags</Typography>
              <Tags attribute="tags" operator="and" limit={6} searchable />
              <Box mt={3} mb={2}>
                <Divider variant="middle" />
              </Box>
              <Typography variant="body2">Filter by members</Typography>
              <MemberCountSlider attribute="memberCount" />
            </CardContent>
            <Box mx={1} my={1}>
              <a
                href="https://www.algolia.com/"
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                <img
                  src={algoliaLogo}
                  style={{
                    maxWidth: '96px',
                    height: 'auto',
                    marginLeft: 'auto',
                    display: 'block',
                  }}
                  alt="Search by algolia"
                />
              </a>
            </Box>
          </Card>
        </Collapse>
      </Box>
    </Box>
  );
};

export default SearchContent;
