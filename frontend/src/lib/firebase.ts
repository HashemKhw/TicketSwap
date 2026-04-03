import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCUSfT6UoW2ZkmS4o5BmzlFQ0x0yMpCk0g",
  authDomain: "tcketswap-7a7eb.firebaseapp.com",
  projectId: "tcketswap-7a7eb",
  storageBucket: "tcketswap-7a7eb.firebasestorage.app",
  messagingSenderId: "113415217096",
  appId: "1:113415217096:web:20cdf3f6bc7ae2c07c6afd",
  measurementId: "G-3E58FJ2R0B",
};

let app: FirebaseApp | undefined;
let analyticsPromise: Promise<Analytics | null> | null = null;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) =>
      supported ? getAnalytics(getFirebaseApp()) : null,
    );
  }

  return analyticsPromise;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}

export function listenToAuthChanges(callback: (user: User | null) => void) {
  if (typeof window === "undefined") return;
  const authInstance = getFirebaseAuth();
  return onAuthStateChanged(authInstance, callback);
}

export async function signInWithGooglePopup() {
  const authInstance = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
}

export function signOutCurrentUser() {
  const authInstance = getFirebaseAuth();
  return signOut(authInstance);
}

export async function createOrUpdateUserProfile(user: User) {
  const db = getFirebaseFirestore();
  const ref = doc(collection(db, "users"), user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    await setDoc(
      ref,
      {
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } else {
    await setDoc(ref, {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function addExampleDocument() {
  const db = getFirebaseFirestore();
  await addDoc(collection(db, "examples"), {
    createdAt: new Date().toISOString(),
    message: "Hello from Firebase Firestore",
  });
}


