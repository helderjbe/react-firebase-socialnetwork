import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import { withSnackbar } from '../Snackbar';
import { Typography, Button, LinearProgress } from '@material-ui/core';

const needsEmailVerification = (authstate) =>
  authstate &&
  !authstate.emailVerified &&
  authstate.providerData
    .map((provider) => provider.providerId)
    .includes('password');

const withEmailVerification = (Component) => {
  class WithEmailVerification extends React.Component {
    state = { isSent: false, loading: false };

    onSendEmailVerification = async () => {
      const { api, callSnackbar } = this.props;

      await this.setState({ loading: true });

      try {
        await api.doSendEmailVerification();
        this.setState({ isSent: true, loading: false });
      } catch (error) {
        this.setState({ loading: false });
        callSnackbar(error.message, 'error');
      }
    };

    render() {
      const { isSent, loading } = this.state;

      return (
        <AuthUserContext.Consumer>
          {(authstate) =>
            needsEmailVerification(authstate) ? (
              <Card elevation={2}>
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h2">
                    {isSent
                      ? 'E-mail confirmation sent'
                      : 'Email confirmation required'}
                  </Typography>
                  <Typography paragraph variant="body1">
                    {isSent
                      ? 'Please check your inbox and spam folder. Once activated, refresh this page to access the contents.'
                      : 'Check your inbox and spam folder for the confirmation link. If not present, you may resend the confirmation link by clicking the button below.'}
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.onSendEmailVerification}
                    disabled={isSent || loading}
                    fullWidth
                  >
                    Send confirmation E-Mail
                  </Button>
                  {loading && <LinearProgress />}
                </CardContent>
              </Card>
            ) : (
              <Component {...this.props} authstate={authstate} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(withSnackbar(WithEmailVerification));
};

export default withEmailVerification;
