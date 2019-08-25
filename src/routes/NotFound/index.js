import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Error from '@material-ui/icons/Error';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const NotFoundPage = () => (
  <Container maxWidth="xs" style={{ padding: 0 }}>
    <Card>
      <CardContent>
        <Box my={2} textAlign="center">
          <Error color="primary" style={{ width: 40, height: 40 }} />
        </Box>
        <Typography component="h1" variant="h5" align="center">
          Not Found
        </Typography>
      </CardContent>
    </Card>
  </Container>
);

export default NotFoundPage;
