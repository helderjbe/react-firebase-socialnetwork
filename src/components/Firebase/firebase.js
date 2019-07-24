import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

export default class Firebase {
  constructor() {
    firebase.initializeApp(config);
    firebase.firestore().enablePersistence();

    this.firebase = firebase;
    this.firestore = firebase.firestore();
    this.auth = firebase.auth();
    this.storage = firebase.storage();
  }

  // TODO: Make it able to cancel all operations in componentwillunmount (to prevent memory leaks)

  // *** Firestore References ***

  // Groups Public
  refGroupsPublic = () => this.firestore.collection('groupsPublic');

  refGroupPublicById = gid => this.refGroupsPublic().doc(gid);

  refGroupPublicGenId = () => this.refGroupsPublic().doc().id;

  // Groups Private
  refGroupsPrivate = () => this.firestore.collection('groupsPrivate');

  refGroupPrivateById = gid => this.refGroupsPrivate().doc(gid);

  // Users Public
  refUsersPublic = () => this.firestore.collection('usersPublic');

  refUserPublicById = uid => this.refUsersPublic().doc(uid);

  // Applications
  refApplications = () => this.firestore.collection('applications');

  refApplicationsByGroupId = gid =>
    this.refApplications()
      .doc(gid)
      .collection('from');

  refApplicationsByUserId = (gid, uid) =>
    this.refApplicationsByGroupId(gid).doc(uid);

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doSendPasswordResetEmail = email => this.auth.sendPasswordResetEmail(email);

  doUpdatePassword = password => this.auth.currentUser.updatePassword(password);

  doAuthStateReload = () => this.auth.currentUser.getIdToken(true);

  // *** Storage API ***

  refGroupPublicBanner = gid =>
    this.storage.ref(`groups/${gid}/public/images/banner.jpeg`);

  refUserPublicAvatar = uid =>
    this.storage.ref(`users/${uid}/public/images/avatar.jpeg`);
}
