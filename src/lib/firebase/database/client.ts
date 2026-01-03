import { getClientApp } from "../auth/client";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  type DocumentSnapshot,
  type DocumentData,
  type QuerySnapshot,
  type PartialWithFieldValue,
  //serverTimestamp
} from "firebase/firestore";

import type { QueryConstraint } from "firebase/firestore";

// const db = initializeFirestore(getClientApp(), {
// 	experimentalForceLongPolling: true,
//   });
const db = getFirestore(getClientApp());

export const NewDocWithCustomID = (
  path: string,
  pathSegments: string,
  data: any
) => {
  return setDoc(doc(db, path, pathSegments), data, { merge: true });
};

export const NewDoc = (path: string, data: any) => {
  return addDoc(collection(db, path), data);
};

export const NewDocWithID = async (path: string, data: any) => {
  const newCityRef = doc(collection(db, path));
  await setDoc(newCityRef, data, { merge: true });
  return newCityRef;
};

export const UpdateDoc = (
  path: string,
  pathSegments: string,
  data: any,
  merge = true
) => {
  return setDoc(doc(db, path, pathSegments), data, { merge });
};

export const DelteDoc = (path: string, pathSegments: string) => {
  return deleteDoc(doc(db, path, pathSegments));
};

export const GetDoc = (path: string, pathSegments: string) => {
  return getDoc(doc(db, path, pathSegments));
};
export const GetDocRef = (path: string, pathSegments: string) => {
  return doc(db, path, pathSegments);
};
export const GetDocs = (path: string) => {
  return getDocs(collection(db, path));
};

export const UpdateDocs = async (
  path: string,
  data: PartialWithFieldValue<DocumentData>,
  ...queryConstraints: QueryConstraint[]
) => {
  const q = query(collection(db, path), ...queryConstraints);
  let docs = await getDocs(q);
  docs.forEach(async (doc) => {
    await setDoc(doc.ref, data, { merge: true });
  });
};

export const GetDocsWithQuery = (
  path: string,
  ...queryConstraints: QueryConstraint[]
) => {
  const q = query(collection(db, path), ...queryConstraints);
  return getDocs(q);
};
export const OnQuerySnapshot = (
  path: string,
  onNext: (snapshot: QuerySnapshot<DocumentData>) => void,
  ...queryConstraints: QueryConstraint[]
) => {
  const q = query(collection(db, path), ...queryConstraints);
  return onSnapshot(q, onNext);
};

export const Snapshot = (
  path: string,
  pathSegments: string,
  onNext: (snapshot: DocumentSnapshot<DocumentData>) => void
) => {
  return onSnapshot(doc(db, path, pathSegments), onNext);
};

export { db };
