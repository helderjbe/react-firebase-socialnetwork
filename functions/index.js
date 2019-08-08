const functions = require('firebase-functions');
const admin = require('firebase-admin');
const merge = require('deepmerge');
const algoliasearch = require('algoliasearch');

admin.initializeApp();

// Initialize Algolia, requires installing Algolia dependencies:
// https://www.algolia.com/doc/api-client/javascript/getting-started/#install
//
// App ID and API Key are stored in functions config variables
const client = algoliasearch(
  functions.config().algolia.app_id,
  functions.config().algolia.api_key
);

const ALGOLIA_INDEX_NAME = functions.config().algolia.index_name;

// TODO: When everyone leaves or group is inactive for x time, delete group

/* GroupsPublic */

exports.onWriteGroupPublic = functions.firestore
  .document('groupsPublic/{gid}')
  .onWrite((change, context) => {
    const document = change.after.exists ? change.after.data() : null;
    const objectID = context.params.gid;

    const index = client.initIndex(ALGOLIA_INDEX_NAME);

    if (document) {
      document.objectID = objectID;
      return index.saveObject(document).catch(error => {
        console.error(error.message);
      });
    } else {
      return index.deleteObject(objectID).catch(error => {
        console.error(error.message);
      });
    }
  });

/* GroupsPublic */

exports.onCreateGroupPrivate = functions.firestore
  .document('groupsPrivate/{gid}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const uid = data.admins[0];
    const gid = context.params.gid;

    return admin
      .auth()
      .getUser(uid)
      .then(user => {
        const newClaims = { groups: { [gid]: 'admin' } };
        let userClaims = user.customClaims;
        if (!isObject(userClaims)) {
          userClaims = {};
        }

        return admin
          .auth()
          .setCustomUserClaims(user.uid, merge.all([userClaims, newClaims]));
      })
      .catch(error => {
        console.error(error);
      });
  });

exports.onUpdateGroupPrivate = functions.firestore
  .document('groupsPrivate/{gid}')
  .onUpdate((change, context) => {
    const data = change.after.data();
    const previousData = change.before.data();
    const gid = context.params.gid;

    const dataDiff = [
      { type: 'admin', ...arrayElementDiff(previousData.admins, data.admins) },
      {
        type: 'member',
        ...arrayElementDiff(previousData.members, data.members)
      }
    ];

    dataDiff.forEach(
      ({ type, deleted, element }) =>
        element &&
        admin
          .auth()
          .getUser(element)
          .then(user => {
            let userClaims = { ...user.customClaims };
            if (deleted) {
              delete userClaims.groups[gid];

              return admin.auth().setCustomUserClaims(user.uid, userClaims);
            } else {
              const newClaims = { groups: { [gid]: type } };
              if (!isObject(userClaims)) {
                userClaims = {};
              }

              return admin
                .auth()
                .setCustomUserClaims(
                  user.uid,
                  merge.all([userClaims, newClaims])
                );
            }
          })
          .catch(error => {
            console.error(error);
          })
    );

    return true;
  });

/* Applications */

exports.onDeleteApplication = functions.firestore
  .document('applications/{application}/from/{user}')
  .onDelete((snap, context) => {
    const data = snap.data();
    const gid = context.params.application;
    const uid = context.params.user;

    if (!('accepted' in data)) {
      return false;
    } else if (!data.accepted) {
      return false;
    }

    // add member to group in firestore
    admin
      .firestore()
      .collection('groupsPrivate')
      .doc(gid)
      .update({
        members: admin.firestore.FieldValue.arrayUnion(uid)
      });

    // increment memberCount
    admin
      .firestore()
      .collection('groupsPublic')
      .doc(gid)
      .update({
        memberCount: admin.firestore.FieldValue.increment(1)
      });

    // add to uid token for group access
    return admin
      .auth()
      .getUser(uid)
      .then(user => {
        const newClaims = { groups: { [gid]: 'member' } };
        let userClaims = user.customClaims;
        if (!isObject(userClaims)) {
          userClaims = {};
        }

        return admin
          .auth()
          .setCustomUserClaims(user.uid, merge.all([userClaims, newClaims]));
      })
      .catch(error => {
        console.error(error);
      });
  });

/** Helper functions **/

function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || (type === 'object' && Boolean(obj));
}

function arrayElementDiff(lhs, rhs) {
  const deleted = lhs.length > rhs.length;
  const changeLength = Math.max(lhs.length, rhs.length);

  for (let i = 0; i < changeLength; i++) {
    if (lhs[i] !== rhs[i]) {
      return { deleted, element: deleted ? lhs[i] : rhs[i] };
    }
  }
  return null;
}
