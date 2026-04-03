"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User as FirebaseUser,
} from "firebase/auth";
import type { User } from "@/lib/types";
import {
  getStoredToken,
  isApiUnavailableError,
  loginRequest,
  meRequest,
  registerRequest,
  setStoredToken,
} from "@/lib/api";
import {
  createOrUpdateUserProfile,
  getFirebaseAuth,
  listenToAuthChanges,
  signOutCurrentUser,
} from "@/lib/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function toAppUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    role: "USER",
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toISOString()
      : new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    const firebaseUser = getFirebaseAuth().currentUser;
    if (!token) {
      setUser(firebaseUser ? toAppUser(firebaseUser) : null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await meRequest();
      setUser(u);
    } catch {
      setStoredToken(null);
      setUser(firebaseUser ? toAppUser(firebaseUser) : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges((firebaseUser) => {
      if (getStoredToken()) return;
      setUser(firebaseUser ? toAppUser(firebaseUser) : null);
      setLoading(false);
    });

    void refreshUser();

    return () => {
      unsubscribe?.();
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user: u, token } = await loginRequest(email, password);
      setStoredToken(token);
      setUser(u);
    } catch (error) {
      if (!isApiUnavailableError(error)) {
        throw error;
      }

      const auth = getFirebaseAuth();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserProfile(cred.user);
      setUser(toAppUser(cred.user));
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    try {
      const { user: u, token } = await registerRequest(email, password);
      setStoredToken(token);
      setUser(u);
    } catch (error) {
      if (!isApiUnavailableError(error)) {
        throw error;
      }

      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await createOrUpdateUserProfile(cred.user);
      setUser(toAppUser(cred.user));
    }
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
    void signOutCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
