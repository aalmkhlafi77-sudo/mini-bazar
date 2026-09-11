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
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigRaw.projectId || "your-firebase-project-id",
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigRaw.appId || "your-firebase-web-app-id",
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigRaw.apiKey || "your-firebase-api-key",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigRaw.authDomain || "your-firebase-project-id.firebaseapp.com",
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfigRaw.firestoreDatabaseId || "(default)",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigRaw.storageBucket || "your-firebase-project-id.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigRaw.messagingSenderId || "your-messaging-sender-id",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigRaw.measurementId || "",
  oAuthClientId: metaEnv.VITE_FIREBASE_OAUTH_CLIENT_ID || firebaseConfigRaw.oAuthClientId || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your-firebase-api-key" &&
  firebaseConfig.apiKey !== "dummy" &&
  !firebaseConfig.apiKey.includes("your-firebase") &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your-firebase-project-id" &&
  firebaseConfig.projectId !== "dummy" &&
  !firebaseConfig.projectId.includes("your-firebase")
);

// Initialize Firebase App
let app, db: Firestore, auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // Initialize Firestore with custom databaseId
  db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
  
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed. Please check firebase-applet-config.json", error);
  // We still need valid-looking objects for methods like onAuthStateChanged so the app doesn't crash on load.
  // Instead of throwing, we'll let the UI handle the auth state.
  app = getApps().length === 0 ? initializeApp({ apiKey: "dummy", projectId: "dummy" }) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
}

export {
  db,
  auth,
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
