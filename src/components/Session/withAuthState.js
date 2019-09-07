import React from 'react';

import equal from 'fast-deep-equal';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withAuthState = Component => {
  class AuthState extends React.Component {
    state = { authstate: null };

    componentDidMount() {
      const { api } = this.props;

      this.cancelAuthStateListener = api.auth.onAuthStateChanged(authstate => {
        if (authstate) {
          this.setState({ authstate });

          if (!this.cancelClaimsListener) {
            this.cancelClaimsListener = api
              .refUserClaimsById(authstate.uid)
              .onSnapshot(async snapshot => {
                const token = await api.doGetIdTokenResult();

                let tokenClaims = {};
                let firestoreClaims = {};

                if (token && token.claims && token.claims.groups) {
                  tokenClaims = token.claims.groups;
                }

                if (snapshot.exists) {
                  firestoreClaims = snapshot.data();
                }

                if (equal(firestoreClaims, tokenClaims) === false) {
                  api.doAuthStateReload();
                }
              });
          }
        } else {
          this.setState({ authstate: null });

          if (this.cancelClaimsListener) {
            this.cancelClaimsListener();
          }
        }
      });
    }

    componentWillUnmount() {
      if (this.cancelAuthStateListener) {
        this.cancelAuthStateListener();
      }

      if (this.cancelClaimsListener) {
        this.cancelClaimsListener();
      }
    }

    render() {
      const { authstate } = this.state;
      return (
        <AuthUserContext.Provider value={authstate}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(AuthState);
};

export default withAuthState;
