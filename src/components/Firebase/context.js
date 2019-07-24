import React from 'react';

const FirebaseContext = React.createContext(null);

export const withFirebase = Component => props => (
  <FirebaseContext.Consumer>
    {api => <Component {...props} api={api} />}
  </FirebaseContext.Consumer>
);

export default FirebaseContext;
