import React, { useState, useEffect } from 'react';

import NotificationsContext from './context';
import { withFirebase } from '../Firebase';
import { withUserSession } from '../Session';

const withNotificationsState = Component => {
  const NotificationsState = props => {
    const { api, authstate } = props;

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
      let cancelNotificationsListener = null;
      if (authstate) {
        cancelNotificationsListener = api
          .refUserNotifications(authstate.uid)
          .orderBy('createdAt', 'desc')
          .limit(5)
          .onSnapshot(snapshots => {
            snapshots.docChanges().forEach(snapshot => {
              const snapshotData = snapshot.doc.data();
              snapshot.newIndex >= 0 &&
                setNotifications(prevData =>
                  snapshot.newIndex === 0
                    ? [snapshotData, ...prevData]
                    : [...prevData, snapshotData]
                );
            });
          });
      } else if (cancelNotificationsListener) {
        setNotifications([]);
        cancelNotificationsListener();
      }

      if (cancelNotificationsListener) {
        return cancelNotificationsListener;
      }
    }, [api, authstate]);

    return (
      <NotificationsContext.Provider value={notifications}>
        <Component {...props} />
      </NotificationsContext.Provider>
    );
  };

  return withUserSession(withFirebase(NotificationsState));
};

export default withNotificationsState;
