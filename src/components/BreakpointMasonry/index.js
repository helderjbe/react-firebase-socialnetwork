import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Masonry from 'react-masonry-css';

import { withUserSession } from '../../components/Session';

/////////////////////////////////////////
//  Styles
/////////////////////////////////////////

const useStyles = makeStyles((theme) => ({
  masonryGrid: {
    display: 'flex',
    marginLeft: theme.spacing(-2),
    width: 'inherit',
  },
  masonryColumn: {
    paddingLeft: theme.spacing(2),
    backgroundClip: 'padding-box',
  },
}));

/////////////////////////////////////////
//  PropTypes
/////////////////////////////////////////

const propTypes = {
  children: PropTypes.node,
};

/////////////////////////////////////////
//  Component
/////////////////////////////////////////

const BreakpointMasonry = ({ children, authstate }) => {
  const classes = useStyles();
  const theme = useTheme();

  const breakpointCols = {
    default: 4,
    [theme.breakpoints.values.xl]: authstate ? 1 : 2,
    [theme.breakpoints.values.lg]: authstate ? 1 : 2,
    [theme.breakpoints.values.md]: authstate ? 1 : 2,
    [theme.breakpoints.values.sm]: 1,
    [theme.breakpoints.values.xs]: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointCols}
      className={classes.masonryGrid}
      columnClassName={classes.masonryColumn}
    >
      {children}
    </Masonry>
  );
};

BreakpointMasonry.propTypes = propTypes;

export default withUserSession(BreakpointMasonry);
