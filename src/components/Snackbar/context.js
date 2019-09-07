import React from 'react';

const SnackbarContext = React.createContext(null);

export const withSnackbar = Component => props => (
  <SnackbarContext.Consumer>
    {callSnackbar => <Component {...props} callSnackbar={callSnackbar} />}
  </SnackbarContext.Consumer>
);

export default SnackbarContext;
