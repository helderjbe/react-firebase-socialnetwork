const merge = require('deepmerge');
const algoliasearch = require('algoliasearch');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');

admin.initializeApp();

const firestore = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const Timestamp = admin.firestore.Timestamp;
const FieldValue = admin.firestore.FieldValue;

// Initialize Algolia, requires installing Algolia dependencies:
// https://www.algolia.com/doc/api-client/javascript/getting-started/#install
//
// App ID and API Key are stored in functions config variables
const client = algoliasearch(
  functions.config().algolia.app_id,
  functions.config().algolia.api_key
);

const ENV_PREFIX = process.env.GCLOUD_PROJECT.includes('prod')
  ? 'prod_'
  : 'dev_';

const ALGOLIA_INDEX_NAME = ENV_PREFIX + functions.config().algolia.index_name;

const MAX_GROUPS = functions.config().groups.max;

/* Groups */

exports.onWriteGroup = functions.firestore
  .document('groups/{gid}')
  .onWrite((change, context) => {
    const data = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;

    const gid = context.params.gid;

    let triggerType;
    if (data && previousData) {
      triggerType = 'update';
    } else if (data) {
      triggerType = 'create';
    } else {
      triggerType = 'delete';
    }

    // Algolia

    // Indexes
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    index.setSettings({
      searchableAttributes: ['title', 'unordered(details)'],
      attributesForFaceting: ['searchable(tags)', 'memberCount'],
      customRanking: ['desc(updatedAt)', 'desc(createdAt)'],
      removeStopWords: true
    });

    // Saving logic
    if (
      (triggerType === 'update' || triggerType === 'create') &&
      data.memberCount < data.memberLimit
    ) {
      // Cater data for saving
      if ('founder' in data) {
        delete data.founder;
      }
      data.objectID = gid;

      return index.saveObject(data);
    } else {
      return index.deleteObject(gid);
    }
  });

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
        createdAt: Timestamp.now().toMillis(),
        role: 'admin'
      });
  });

/* Group Members */

exports.onWriteGroupMember = functions.firestore
  .document('groups/{gid}/members/{uid}')
  .onWrite(async (change, context) => {
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
      const user = await auth.getUser(uid);

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

      const updatedClaims = merge.all([currentClaims, newClaims]);

      if (updatedClaims.groups.length > MAX_GROUPS) {
        return false;
      }

      await auth.setCustomUserClaims(uid, updatedClaims);
      await firestore
        .collection('userClaims')
        .doc(uid)
        .set(updatedClaims.groups);
    }

    return true;
  });

exports.onDeleteGroupMember = functions.firestore
  .document('groups/{gid}/members/{uid}')
  .onDelete(async (_snap, context) => {
    const gid = context.params.gid;

    const doc = await firestore
      .collection('groups')
      .doc(gid)
      .get();

    if (doc.data().memberCount <= 1) {
      return deleteGroup(gid);
    } else {
      return updateMemberCount(gid, -1);
    }
  });

exports.onCreateGroupMember = functions.firestore
  .document('groups/{gid}/members/{uid}')
  .onCreate((_snap, context) => {
    const gid = context.params.gid;

    return updateMemberCount(gid, 1);
  });

/* Applications */

exports.onCreateApplication = functions.firestore
  .document('groups/{gid}/applications/{uid}')
  .onCreate(async (snap, context) => {
    //const data = snap.data();
    const gid = context.params.gid;
    const uid = context.params.uid;

    const snapshots = await firestore
      .collection('groups')
      .doc(gid)
      .collection('members')
      .where('role', '==', 'admin')
      .limit(15)
      .get();

    return snapshots.docs.forEach(snapshot => {
      firestore
        .collection('users')
        .doc(snapshot.id)
        .collection('notifications')
        .add({
          createdAt: Timestamp.now().toMillis(),
          type: 'application',
          uid,
          gid
        });
    });
  });

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
    firestore
      .collection('groups')
      .doc(gid)
      .collection('members')
      .doc(uid)
      .set(
        {
          createdAt: Timestamp.now().toMillis(),
          role: 'member'
        },
        { merge: true }
      );

    // notify user of application accepted
    return firestore
      .collection('users')
      .doc(uid)
      .collection('notifications')
      .add({
        createdAt: Timestamp.now().toMillis(),
        type: 'accepted',
        gid
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
    .bucket(JSON.parse(process.env.FIREBASE_CONFIG).storageBucket)
    .deleteFiles({
      force: true,
      prefix: `groups/${gid}/`
    });

  // Delete DB
  return firebase_tools.firestore.delete(`groups/${gid}`, {
    project: process.env.GCLOUD_PROJECT,
    recursive: true,
    yes: true
  });
}

function updateMemberCount(gid, value) {
  if (value > 0) {
    return firestore
      .collection('groups')
      .doc(gid)
      .update({
        updatedAt: Timestamp.now().toMillis(),
        memberCount: FieldValue.increment(value)
      });
  } else {
    return firestore
      .collection('groups')
      .doc(gid)
      .update({
        memberCount: FieldValue.increment(value)
      });
  }
}
