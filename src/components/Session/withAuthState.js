import React from 'react';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';

const withAuthState = Component => {
  class AuthState extends React.Component {
    state = { authUser: null };

    componentDidMount() {
      const { api } = this.props;

      this.listener = api.auth.onAuthStateChanged(authUser => {
        authUser
          ? this.setState({ authUser })
          : this.setState({ authUser: null });
      });
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Provider value={this.state.authUser}>
          <Component {...this.props} />
        </AuthUserContext.Provider>
      );
    }
  }

  return withFirebase(AuthState);
};

export default withAuthState;
