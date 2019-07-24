import React from 'react';

import { Link } from 'react-router-dom';

import * as ROUTES from '../../constants/routes';

import Typography from '@material-ui/core/Typography';
import TextLink from '@material-ui/core/Link';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

const CreateGroupLink = () => {
  return (
    <Grid item xs={12}>
      <Link to={ROUTES.GROUPS_NEW} style={{ textDecoration: 'none' }}>
        <Card>
          <CardContent>
            <Box textAlign="center" mt={1}>
              <Typography variant="body2">
                Can't find what you're looking for?
              </Typography>
              <Typography variant="h5">Create a new group</Typography>
            </Box>
          </CardContent>
        </Card>
      </Link>
    </Grid>
  );
};

export default CreateGroupLink;
