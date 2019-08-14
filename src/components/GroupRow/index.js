import React from 'react';
import PropTypes from 'prop-types';

import { Link, withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

import ButtonBase from '@material-ui/core/ButtonBase';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';

import defaultBanner from '../../common/images/defaultBanner.jpg';

const GroupRow = props => {
  return (
    <ButtonBase
      component={Link}
      to={ROUTES.GROUPS_ID.replace(':gid', props.gid)}
      style={{ display: 'block' }}
    >
      <GridListTile component="div">
        <img
          src={props.bannerUrl || defaultBanner}
          alt={`${props.title} banner`}
          style={{ width: '100%', height: 'auto' }}
        />
        <GridListTileBar
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          title={props.title}
          subtitle={'Last Message'}
          titlePosition="top"
        />
      </GridListTile>
    </ButtonBase>
  );
};

GroupRow.propTypes = {
  gid: PropTypes.string.isRequired,
  limit: PropTypes.number,
  memberCount: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  bannerUrl: PropTypes.string
};

export default withRouter(GroupRow);
