import React from 'react';
import { Link } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import LockOpen from '@material-ui/icons/LockOpen';
import Typography from '@material-ui/core/Typography';
import TextLink from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';

import SignUp from '../../components/SignUp';

const SignUpPage = () => (
  <Container maxWidth="xs" style={{ padding: 0 }}>
    <Card elevation={2}>
      <CardContent>
        <Avatar style={{ margin: '0 auto 8px auto' }}>
          <LockOpen />
        </Avatar>
        <Typography component="h1" variant="h5" align="center">
          Sign up
        </Typography>
        <SignUp />
        <Box mt={1}>
          <TextLink component={Link} to={ROUTES.SIGN_IN} variant="subtitle1">
            Already have an account? Sign in
          </TextLink>
        </Box>
      </CardContent>
    </Card>
  </Container>
);

export default SignUpPage;
