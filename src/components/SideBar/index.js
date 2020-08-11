import React from 'react';

import { withEmailVerification, withUserSession } from '../Session';

import MyGroupsHandler from '../MyGroupsHandler';
import { Typography, Card, CardContent } from '@material-ui/core';

const SideBar = (props) => {
  const { authstate } = props;
  if (!authstate) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="body1" color="textSecondary">
            Please sign in to check out your groups
          </Typography>
        </CardContent>
      </Card>
    );
  } else {
    return <MyGroupsHandler />;
  }
};

export default withEmailVerification(withUserSession(SideBar));
