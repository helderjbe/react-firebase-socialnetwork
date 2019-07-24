import React from 'react';

const AuthUserContext = React.createContext(null);

export const withUserSession = Component => props => (
  <AuthUserContext.Consumer>
    {authstate => <Component {...props} authstate={authstate} />}
  </AuthUserContext.Consumer>
);

export default AuthUserContext;
