import React, { Component } from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Build from '@material-ui/icons/Build';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import ResetPassword from './ResetPassword';
import VerifyEmail from './VerifyEmail';
import RecoverEmail from './RecoverEmail';

class EmailHandlerPage extends Component {
  state = {
    mode: null,
    actionCode: null,
  };

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);

    this.setState({
      mode: urlParams.get('mode') || '',
      actionCode: urlParams.get('oobCode'),
    });
  }

  render() {
    const { mode, actionCode } = this.state;

    let renderMode;

    switch (mode) {
      case 'resetPassword':
        // Display reset password handler and UI.
        renderMode = <ResetPassword actionCode={actionCode} />;
        break;
      case 'recoverEmail':
        renderMode = <RecoverEmail actionCode={actionCode} />;
        break;
      case 'verifyEmail':
        renderMode = <VerifyEmail actionCode={actionCode} />;
        break;
      case '':
        renderMode = (
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Bad Request
          </Typography>
        );
        break;
      default:
        renderMode = (
          <Typography variant="caption" align="center">
            Loading ...
          </Typography>
        );
    }

    return (
      <Container maxWidth="xs" style={{ padding: 0 }}>
        <Card elevation={2}>
          <CardContent>
            <Box my={2} textAlign="center">
              <Build color="primary" style={{ width: 40, height: 40 }} />
            </Box>
            {renderMode}
          </CardContent>
        </Card>
      </Container>
    );
  }
}

export default EmailHandlerPage;
