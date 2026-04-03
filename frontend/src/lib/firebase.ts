import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

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

