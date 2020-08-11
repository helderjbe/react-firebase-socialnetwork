import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import NewGroup from '../../../components/NewGroup';

import {
  withProtectedRoute,
  withEmailVerification,
} from '../../../components/Session';

const NewGroupPage = ({ authstate }) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography
          component="h1"
          variant="overline"
          align="center"
          gutterBottom
        >
          Create a new group
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
  authstate: PropTypes.object,
};

const condition = (authUser) => Boolean(authUser);

export default withProtectedRoute(condition)(
  withEmailVerification(NewGroupPage)
);
