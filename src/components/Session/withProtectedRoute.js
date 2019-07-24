import React from 'react';
import { withRouter } from 'react-router-dom';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';

const withProtectedRoute = condition => Component => {
  class ProtectedRoute extends React.Component {
    componentDidMount() {
      const { api, history } = this.props;

      this.listener = api.auth.onAuthStateChanged(authUser => {
        if (!condition(authUser)) {
          history.push(ROUTES.SIGN_IN);
        }
      });
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authstate =>
            condition(authstate) && (
              <Component {...this.props} authstate={authstate} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withRouter(withFirebase(ProtectedRoute));
};

export default withProtectedRoute;
