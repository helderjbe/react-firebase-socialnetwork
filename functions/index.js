const merge = require('deepmerge');
const algoliasearch = require('algoliasearch');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');

admin.initializeApp();

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const FieldValue = admin.firestore.FieldValue;

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

/*exports.onWriteGroup = functions.firestore
  .document('groups/{gid}')
  .onWrite((change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;

    const gid = context.params.gid;

    // Algolia
    const index = client.initIndex(ALGOLIA_INDEX_NAME);

    if (triggerType === 'update' || triggerType === 'create') {
      data.objectID = gid;
      index.saveObject(data).catch(error => {
        throw new Error(error);
      });
    } else {
      index.deleteObject(gid).catch(error => {
        throw new Error(error);
      });
    }
  });*/

exports.onCreateGroup = functions.firestore
  .document('groups/{gid}')
  .onCreate((snap, context) => {
    const data = snap.data();

    const gid = context.params.gid;

    /* On Group Create, add first admin to group */
    return firestore
      .collection('groups')
      .doc(gid)
      .collection('members')
      .doc(data.founder)
      .set({
        createdAt: FieldValue.serverTimestamp(),
        role: 'admin'
      })
      .catch(error => {
        throw new Error(error);
      });
  });

/* Group Members */

exports.onWriteGroupMember = functions.firestore
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
      return auth.getUser(uid).then(user => {
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

        return auth.setCustomUserClaims(
          user.uid,
          merge.all([currentClaims, newClaims])
        );
      });
    }

    return true;
  });

exports.onDeleteGroupMember = functions.firestore
  .document('groups/{gid}/members/{uid}')
  .onDelete((_snap, context) => {
    const gid = context.params.gid;

    return firestore
      .collection('groups')
      .doc(gid)
      .get()
      .then(doc => {
        if (doc.data().memberCount <= 1) {
          return deleteGroup(gid);
        } else {
          return updateMemberCount(gid, -1);
        }
      })
      .catch(error => {
        throw new Error(error);
      });
  });

exports.onCreateGroupMember = functions.firestore
  .document('groups/{gid}/members/{uid}')
  .onCreate((_snap, context) => {
    const gid = context.params.gid;

    return updateMemberCount(gid, 1);
  });

/* Applications */

exports.onDeleteApplication = functions.firestore
  .document('groups/{gid}/applications/{uid}')
  .onDelete((snap, context) => {
    const data = snap.data();
    const gid = context.params.gid;
    const uid = context.params.uid;

    if (!('accepted' in data)) {
      return false;
    } else if (!data.accepted) {
      return false;
    }

    // add member to group in firestore
    return firestore
      .collection('groups')
      .doc(gid)
      .collection('members')
      .doc(uid)
      .set(
        {
          createdAt: FieldValue.serverTimestamp(),
          role: 'member'
        },
        { merge: true }
      )
      .catch(error => {
        throw new Error(error);
      });
  });

/** Helper functions **/

function isObject(obj) {
  const type = typeof obj;
  return type === 'function' || (type === 'object' && Boolean(obj));
}

function deleteGroup(gid) {
  // Delete Storage Files
  storage
    .bucket(JSON.parse(process.env.FIREBASE_CONFIG.storageBucket))
    .deleteFiles({
      force: true,
      prefix: `groups/${gid}/`
    });

  // Delete DB
  firebase_tools.firestore
    .delete(`groups/${gid}`, {
      project: process.env.GCLOUD_PROJECT,
      recursive: true,
      yes: true
    })
    .catch(error => {
      throw new Error(error);
    });
}

function updateMemberCount(gid, value) {
  return firestore
    .collection('groups')
    .doc(gid)
    .update({
      memberCount: FieldValue.increment(value)
    })
    .catch(error => {
      throw new Error(error);
    });
}
