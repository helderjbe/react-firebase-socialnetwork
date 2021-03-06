import React from 'react';
import { Link } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import TextLink from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

import SignIn from './SignIn';

const SignInPage = () => (
  <Container maxWidth="xs" style={{ padding: 0 }}>
    <Card elevation={2}>
      <CardContent>
        <SignIn />
        <Box mt={1}>
          <Grid
            container
            spacing={1}
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <TextLink
                component={Link}
                to={ROUTES.SIGN_UP}
                variant="subtitle1"
              >
                Don't have an account? Sign up
              </TextLink>
            </Grid>
            <Grid item>
              <TextLink
                component={Link}
                to={ROUTES.PASSWORD_FORGET}
                variant="subtitle1"
              >
                Forgot password?
              </TextLink>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  </Container>
);

export default SignInPage;
