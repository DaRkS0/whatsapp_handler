// Import the functions you need from the SDKs you need
import { env  } from "$env/dynamic/private";

import type { FirebaseApp } from "firebase/app";

import { initializeApp, getApps, getApp } from "firebase/app";

import {
  type Auth,
  getAuth,
  signInWithEmailAndPassword,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  setPersistence,
  signInWithEmailLink,
  signInWithCustomToken,
  browserLocalPersistence,
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
};

export const getClientApp: () => FirebaseApp = () => {
  if (getApps().length) return getApp();
  // console.log({ firebaseConfig });
  const clientApp = initializeApp(firebaseConfig);
  const db = initializeFirestore(clientApp, {
    experimentalForceLongPolling: true,
  });
  const auth = getAuth(clientApp);
  //auth.setPersistence({ type: 'NONE' });
  setPersistence(auth, browserLocalPersistence);

  return clientApp;
};

export const getClientAuth: () => Auth = () => {
  return getAuth(getClientApp());
};

export const isMagicLink = (link: string) => {
  const auth = getAuth(getClientApp());

  return isSignInWithEmailLink(auth, link);
};

export const signInWithMagicLink = (email: string, link: string) => {
  const auth = getAuth(getClientApp());

  return signInWithEmailLink(auth, email, link);
};

export const sendMagicLink = (email: string, redirectUrl: string) => {
  const auth = getAuth(getClientApp());
  const actionCodeSettings = {
    url: redirectUrl,
    handleCodeInApp: true,
  };
  return sendSignInLinkToEmail(auth, email, actionCodeSettings);
};

export const signInWithEmail = (email: string, pass: string) => {
  const auth = getAuth(getClientApp());
  return signInWithEmailAndPassword(auth, email, pass);
};

export const CustomTokenSignIn = (token: string) => {
  const auth = getAuth(getClientApp());
  return signInWithCustomToken(auth, token);
};

export const AuthHandler = getAuth(getClientApp());
