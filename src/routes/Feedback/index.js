import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Feedback from '../../components/Feedback';

import { withProtectedRoute } from '../../components/Session';

const FeedbackPage = ({ authstate }) => (
  <Card>
    <CardContent>
      <Typography component="h1" variant="overline" align="center" gutterBottom>
        Feedback
      </Typography>
      <Typography component="h2" variant="caption" align="center">
        Your feedback is crucial to our success. Any criticisms, suggestions and
        improvements you give us is highly appreciated. WE READ ALL FEEDBACK
        GIVEN! Thank you.
      </Typography>
      <Feedback authstate={authstate} />
    </CardContent>
  </Card>
);

FeedbackPage.propTypes = {
  authstate: PropTypes.object
};

const condition = authUser => Boolean(authUser);

export default withProtectedRoute(condition)(FeedbackPage);
