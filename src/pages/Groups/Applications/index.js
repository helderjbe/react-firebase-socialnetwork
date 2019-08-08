import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Applications from '../../../components/Applications';

import { withProtectedRoute } from '../../../components/Session';

const ApplicationsPage = props => {
  const { authstate } = props;
  return (
    <Card>
      <CardContent>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Applications
        </Typography>
        <Applications authstate={authstate} />
      </CardContent>
    </Card>
  );
};

ApplicationsPage.propTypes = {
  authstate: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(ApplicationsPage);
