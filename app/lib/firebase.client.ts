import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  browserSessionPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let appInstance: FirebaseApp | null = null;
let persistenceSet = false;

function assertClient(): void {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK is only available in the browser.");
  }
}

function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

function ensureConfigured(config: FirebaseConfig): void {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env vars: ${missing.join(", ")}. Check your .env file.`,
    );
  }
}

function getFirebaseApp(): FirebaseApp {
  assertClient();

  if (appInstance) {
    return appInstance;
  }

  const config = getFirebaseConfig();
  ensureConfigured(config);

  appInstance = getApps()[0] ?? initializeApp(config);
  return appInstance;
}

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const auth = getFirebaseAuth();

  if (!persistenceSet) {
    await setPersistence(auth, browserSessionPersistence);
    persistenceSet = true;
  }

  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutAdmin(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function observeAdminAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
