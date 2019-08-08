import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import GroupDetails from '../../../components/GroupDetails';

import { withProtectedRoute } from '../../../components/Session';

const GroupDetailsPage = props => {
  const { authstate } = props;
  return (
    <Card>
      <CardContent>
        <GroupDetails authstate={authstate} />
      </CardContent>
    </Card>
  );
};

GroupDetailsPage.propTypes = {
  authstate: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(GroupDetailsPage);
