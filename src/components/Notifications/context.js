import React from 'react';

const NotificationsContext = React.createContext(null);

export const withNotifications = Component => props => (
  <NotificationsContext.Consumer>
    {notifications => <Component {...props} notifications={notifications} />}
  </NotificationsContext.Consumer>
);

export default NotificationsContext;
