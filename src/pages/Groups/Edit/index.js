import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import EditGroup from '../../../components/EditGroup';

import { withProtectedRoute } from '../../../components/Session';

const EditGroupPage = props => {
  const { authstate } = props;
  return (
    <Card>
      <CardContent>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Edit Group Details
        </Typography>
        <EditGroup authstate={authstate} />
      </CardContent>
    </Card>
  );
};

EditGroupPage.propTypes = {
  authstate: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(EditGroupPage);
