const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.createGroupClaims = functions.firestore
  .document('groupsPrivate/{gid}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const uid = data.admins[0];
    const gid = context.params.gid;

    return admin
      .auth()
      .getUser(uid)
      .then(user => {
        let currentCustomClaims = user.customClaims;

        if (!currentCustomClaims) {
          currentCustomClaims = { groups: { [gid]: true } };
        } else if ('groups' in currentCustomClaims) {
          currentCustomClaims.groups[gid] = true;
        } else {
          currentCustomClaims.groups = { [gid]: true };
        }

        return admin.auth().setCustomUserClaims(user.uid, currentCustomClaims);
      })
      .catch(error => {
        console.error(error);
      });
  });
