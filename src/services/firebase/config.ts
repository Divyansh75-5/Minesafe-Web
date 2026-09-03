import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// TODO: Replace with actual config from Firebase Console
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'minesafe-26041.firebaseapp.com',
  projectId: 'minesafe-26041',
  storageBucket: 'minesafe-26041.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let persistenceEnabled = false;

// Demo mode: when the config still has placeholder keys, the app runs fully self-contained with
// seeded demo data (no network). Set real keys to switch to live Firebase.
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey != null &&
    firebaseConfig.apiKey.length > 0 &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    !firebaseConfig.appId.includes('YOUR_')
  );
}

export function initFirebase(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    // Demo mode: no live Firebase. Data services fall back to seeded demo data.
    return null;
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    enablePersistence();
  }
  return app;
}

async function enablePersistence() {
  if (!persistenceEnabled && db) {
    try {
      await enableIndexedDbPersistence(db);
      persistenceEnabled = true;
    } catch {
      // App fails to open offline or same tab, ignore
    }
  }
}

export function getApp(): FirebaseApp {
  if (!app) throw new Error('Firebase not initialized. Call initFirebase() first.');
  return app;
}

export function getAuthInstance(): Auth {
  return auth;
}

export function getDbInstance(): Firestore {
  return db;
}

export function getStorageInstance(): FirebaseStorage {
  return storage;
}
