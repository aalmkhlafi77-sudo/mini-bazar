import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigRaw from '../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: firebaseConfigRaw.projectId || "inner-abstraction-x1ttq",
  appId: firebaseConfigRaw.appId || "1:383090493520:web:7115bb48271645b7936955",
  apiKey: firebaseConfigRaw.apiKey || "AIzaSyBEw1zC_rryPBx44eaphADBit-2jRim2d0",
  authDomain: firebaseConfigRaw.authDomain || "inner-abstraction-x1ttq.firebaseapp.com",
  firestoreDatabaseId: firebaseConfigRaw.firestoreDatabaseId || "ai-studio-minibazaar-8804aa4a-babc-465a-a062-433fc4c3ee49",
  storageBucket: firebaseConfigRaw.storageBucket || "inner-abstraction-x1ttq.firebasestorage.app",
  messagingSenderId: firebaseConfigRaw.messagingSenderId || "383090493520",
  measurementId: firebaseConfigRaw.measurementId || "",
  oAuthClientId: firebaseConfigRaw.oAuthClientId || "383090493520-nk9sfs7mnkgfm17o7v4vdk8fud1cb7cu.apps.googleusercontent.com",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
};

export default app;
