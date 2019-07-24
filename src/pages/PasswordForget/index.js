import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import SettingsBackupRestore from '@material-ui/icons/SettingsBackupRestore';
import Typography from '@material-ui/core/Typography';

import PasswordForget from '../../components/PasswordForget';

const PasswordForgetPage = () => (
  <Container maxWidth="xs" style={{ padding: 0 }}>
    <Card>
      <CardContent>
        <Avatar style={{ margin: '0 auto 8px auto' }}>
          <SettingsBackupRestore />
        </Avatar>
        <Typography component="h1" variant="h5" align="center">
          Password Reset
        </Typography>
        <PasswordForget />
      </CardContent>
    </Card>
  </Container>
);

export default PasswordForgetPage;
