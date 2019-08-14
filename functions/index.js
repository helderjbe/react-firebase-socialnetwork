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

/* Groups */

exports.onWriteGroup = functions.firestore
  .document('groups/{gid}')
  .onWrite((change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;
    let triggerType;
    if (data && previousData) {
      triggerType = 'update';
    } else if (data) {
      triggerType = 'create';
    } else {
      triggerType = 'delete';
    }

    const gid = context.params.gid;

    /* Algolia */
    /*const index = client.initIndex(ALGOLIA_INDEX_NAME);

    if (triggerType === 'update' || triggerType === 'create') {
      data.objectID = gid;
      index.saveObject(data).catch(error => {
        throw new Error(error);
      });
    } else {
      index.deleteObject(gid).catch(error => {
        throw new Error(error);
      });
    }*/

    /* On Group Create, add first admin to group */
    if (triggerType === 'create') {
      admin
        .firestore()
        .collection('groups')
        .doc(gid)
        .collection('members')
        .doc(data.founder)
        .set({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          role: 'admin'
        })
        .catch(error => {
          throw new Error(error);
        });
    }

    return true;
  });

/* Group Members */

exports.onWriteGroupMembers = functions.firestore
  .document('groups/{gid}/members/{uid}')
  .onWrite((change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;
    let triggerType;
    if (data && previousData) {
      triggerType = 'update';
    } else if (data) {
      triggerType = 'create';
    } else {
      triggerType = 'delete';
    }

    const gid = context.params.gid;
    const uid = context.params.uid;

    /* Custom Claims */
    // only change custom claims if there is a change in the data role
    if (!(triggerType === 'update' && data.role === previousData.role)) {
      // eslint-disable-next-line promise/catch-or-return
      admin
        .auth()
        .getUser(uid)
        .then(user => {
          let currentClaims = {};
          let newClaims = {};

          if (isObject(user.customClaims)) {
            currentClaims = { ...user.customClaims };
          }

          switch (triggerType) {
            case 'create':
            case 'update':
              newClaims = { groups: { [gid]: data.role } };
              break;
            case 'delete':
              delete currentClaims.groups[gid];
          }

          return admin
            .auth()
            .setCustomUserClaims(
              user.uid,
              merge.all([currentClaims, newClaims])
            );
        });
    }

    /* memberCount */
    // Only update if creating or deleting
    if (!data || !previousData) {
      admin
        .firestore()
        .collection('groups')
        .doc(gid)
        .update({
          memberCount: admin.firestore.FieldValue.increment(
            triggerType === 'delete' ? -1 : 1
          )
        })
        .catch(error => {
          throw new Error(error);
        });
    }

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
    return admin
      .firestore()
      .collection('groupsPrivate')
      .doc(gid)
      .update({
        members: admin.firestore.FieldValue.arrayUnion(uid)
      })
      .catch(error => {
        throw new Error(error);
      });
  });

/** Helper functions **/

function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || (type === 'object' && Boolean(obj));
}
