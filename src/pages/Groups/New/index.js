import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import NewGroup from '../../../components/NewGroup';

import { withProtectedRoute } from '../../../components/Session';

const NewGroupPage = props => {
  const { authstate } = props;
  return (
    <Card>
      <CardContent>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Create a Group
        </Typography>
        <Typography
          component="h2"
          variant="caption"
          color="textSecondary"
          align="center"
        >
          Easily create a group by filling out the fields below. Don't worry,
          you can edit more details later.
        </Typography>
        <NewGroup authstate={authstate} />
      </CardContent>
    </Card>
  );
};

NewGroupPage.propTypes = {
  authstate: PropTypes.object.isRequired
};

const condition = authUser => !!authUser;

export default withProtectedRoute(condition)(NewGroupPage);