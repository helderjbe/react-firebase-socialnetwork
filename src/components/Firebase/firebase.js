import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

import { APP_CONFIG } from '../../config';

export default class Firebase {
  constructor() {
    firebase.initializeApp(APP_CONFIG);
    firebase.firestore().enablePersistence();

    this.firebase = firebase;
    this.firestore = firebase.firestore();
    this.auth = firebase.auth();
    this.storage = firebase.storage();
  }

  // *** Firestore References ***

  // Groups
  refGroups = () => this.firestore.collection('groups');

  refGroupById = gid => this.refGroups().doc(gid);

  // Group Members
  //TODO: UPDATE ALL FILES WITH CHANGES -> IMPLEMENT FUNCTIONS WITH CUSTOM CLAIMS
  refGroupMembers = gid => this.refGroupById(gid).collection('members');

  refGroupMemberById = (gid, uid) => this.refGroupMembers(gid).doc(uid);

  // Group Messages
  refGroupMessages = gid => this.refGroupById(gid).collection('messages');

  // Group Applications
  refGroupApplications = gid =>
    this.refGroupById(gid).collection('applications');

  refGroupApplicationById = (gid, uid) =>
    this.refGroupApplications(gid).doc(uid);

  // Users
  refUsers = () => this.firestore.collection('users');

  refUserById = uid => this.refUsers().doc(uid);

  // User Notifications
  refUserNotifications = uid =>
    this.refUserById(uid).collection('notifications');

  // User Claims
  refUserClaims = () => this.firestore.collection('userClaims');

  refUserClaimsById = uid => this.refUserClaims().doc(uid);

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithRedirect = provider => this.auth.signInWithRedirect(provider);

  doSignOut = () => this.auth.signOut();

  doSendPasswordResetEmail = email => this.auth.sendPasswordResetEmail(email);

  doUpdatePassword = password => this.auth.currentUser.updatePassword(password);

  doAuthStateReload = () => this.auth.currentUser.getIdToken(true);

  doGetIdTokenResult = () => this.auth.currentUser.getIdTokenResult();

  doSendEmailVerification = () => this.auth.currentUser.sendEmailVerification();

  // *** Storage API ***

  refGroupBanner = gid =>
    this.storage.ref(`groups/${gid}/public/images/banner.jpeg`);

  refUserAvatar = uid =>
    this.storage.ref(`users/${uid}/public/images/avatar.jpeg`);
}
