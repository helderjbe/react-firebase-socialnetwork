import React from 'react';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import { Typography, Button } from '@material-ui/core';

const needsEmailVerification = authstate =>
  authstate &&
  !authstate.emailVerified &&
  authstate.providerData
    .map(provider => provider.providerId)
    .includes('password');

const withEmailVerification = Component => {
  class WithEmailVerification extends React.Component {
    state = { isSent: false, error: null };

    onSendEmailVerification = () => {
      const { api } = this.props;
      api
        .doSendEmailVerification()
        .then(() => this.setState({ isSent: true }))
        .catch(error => this.setState({ error }));
    };

    render() {
      const { isSent, error } = this.state;

      return (
        <AuthUserContext.Consumer>
          {authstate =>
            needsEmailVerification(authstate) ? (
              <Card>
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
                    disabled={isSent}
                  >
                    Send confirmation E-Mail
                  </Button>
                  {error && (
                    <Typography color="error">{error.message}</Typography>
                  )}
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

  return withFirebase(WithEmailVerification);
};

export default withEmailVerification;
