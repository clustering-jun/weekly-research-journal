import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import type { AppData } from "../types";

export type FirebaseUser = {
  uid: string;
  displayName: string;
  email: string;
};

export type CloudSnapshot = {
  data: AppData | null;
  updatedAt: Date | null;
};

type CloudDocument = {
  data?: AppData;
  updatedAt?: Timestamp;
};

export function isFirebaseConfigured() {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
  );
}

export function listenFirebaseAuth(callback: (user: FirebaseUser | null) => void) {
  if (!isFirebaseConfigured()) return () => undefined;

  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    callback(user ? toFirebaseUser(user) : null);
  });
}

export async function signInFirebase() {
  ensureConfigured();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(getFirebaseAuth(), provider);
  return toFirebaseUser(credential.user);
}

export async function signOutFirebase() {
  ensureConfigured();
  await signOut(getFirebaseAuth());
}

export async function loadCloudData(uid: string): Promise<CloudSnapshot> {
  ensureConfigured();
  const snapshot = await getDoc(dataRef(uid));
  if (!snapshot.exists()) return { data: null, updatedAt: null };

  const value = snapshot.data() as CloudDocument;
  return {
    data: value.data ?? null,
    updatedAt: value.updatedAt?.toDate?.() ?? null,
  };
}

export async function saveCloudData(uid: string, data: AppData) {
  ensureConfigured();
  await setDoc(dataRef(uid), {
    data,
    updatedAt: serverTimestamp(),
  });
}

function dataRef(uid: string) {
  return doc(getFirebaseDb(), "users", uid, "journal", "main");
}

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

function getFirebaseApp() {
  const apps = getApps();
  if (apps.length) return apps[0];
  return initializeApp(getFirebaseConfig());
}

function getFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  };
}

function ensureConfigured() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase 환경 변수가 설정되지 않았습니다.");
  }
}

function toFirebaseUser(user: User): FirebaseUser {
  return {
    uid: user.uid,
    displayName: user.displayName ?? "",
    email: user.email ?? "",
  };
}
