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
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from 'firebase/auth';
import firebaseConfigRaw from '../firebase-applet-config.json';

const metaEnv = ((import.meta as unknown) as { env?: Record<string, string> })?.env || {};

export const firebaseConfig = {
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigRaw.projectId || "inner-abstraction-x1ttq",
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigRaw.appId || "1:383090493520:web:7115bb48271645b7936955",
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigRaw.apiKey || "AIzaSyBEw1zC_rryPBx44eaphADBit-2jRim2d0",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigRaw.authDomain || "inner-abstraction-x1ttq.firebaseapp.com",
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfigRaw.firestoreDatabaseId || "ai-studio-minibazaar-8804aa4a-babc-465a-a062-433fc4c3ee49",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigRaw.storageBucket || "inner-abstraction-x1ttq.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigRaw.messagingSenderId || "383090493520",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigRaw.measurementId || "",
  oAuthClientId: metaEnv.VITE_FIREBASE_OAUTH_CLIENT_ID || firebaseConfigRaw.oAuthClientId || "383090493520-nk9sfs7mnkgfm17o7v4vdk8fud1cb7cu.apps.googleusercontent.com",
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
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
};

export default app;
