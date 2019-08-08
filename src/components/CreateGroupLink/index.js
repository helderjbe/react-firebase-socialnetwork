import React from 'react';

import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';

const CreateGroupLink = () => {
  return (
    <CardContent>
      <Box textAlign="center" mt={1}>
        <Typography variant="body2">
          Can't find what you're looking for?
        </Typography>
        <Typography variant="h5">Create a new group</Typography>
      </Box>
    </CardContent>
  );
};

export default CreateGroupLink;
