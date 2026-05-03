"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  deleteUser,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  createUserDoc,
  getUserDoc,
  updateUserProgress,
  deleteUserDoc,
  type FirestoreUser,
  type ProgressUpdate,
} from "@/lib/firestore";

interface AuthContextValue {
  firebaseUser: User | null;
  userDoc: FirestoreUser | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUserDoc: () => Promise<void>;
  saveProgress: (updates: ProgressUpdate) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* Auth state listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const doc = await getUserDoc(user.uid);
          setUserDoc(doc);
        } catch {
          // Firestore rules not yet published — auth still works
        }
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshUserDoc = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const doc = await getUserDoc(firebaseUser.uid);
      setUserDoc(doc);
    } catch { /* ignore */ }
  }, [firebaseUser]);

  const saveProgress = useCallback(
    async (updates: ProgressUpdate) => {
      if (!firebaseUser) return;
      await updateUserProgress(firebaseUser.uid, updates);
      await refreshUserDoc();
    },
    [firebaseUser, refreshUserDoc]
  );

  /* Email / Password sign-up */
  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    try {
      await createUserDoc(cred.user.uid, { displayName: name, email, photoURL: null });
      const doc = await getUserDoc(cred.user.uid);
      setUserDoc(doc);
    } catch { /* Firestore not ready */ }
  };

  /* Email / Password login */
  const logIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  /* Google Sign-In — popup */
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const cred = await signInWithPopup(auth, provider);
    try {
      await createUserDoc(cred.user.uid, {
        displayName: cred.user.displayName ?? "Voter",
        email: cred.user.email ?? "",
        photoURL: cred.user.photoURL,
      });
      const doc = await getUserDoc(cred.user.uid);
      setUserDoc(doc);
    } catch { /* Firestore not ready */ }
  };

  /* Sign out */
  const logOut = async () => {
    await signOut(auth);
    setUserDoc(null);
  };

  /* Delete account */
  const deleteAccount = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    // 1. Delete from Firestore first
    await deleteUserDoc(uid);
    // 2. Delete from Auth
    await deleteUser(auth.currentUser);
    // 3. Clear state
    setFirebaseUser(null);
    setUserDoc(null);
    // 4. Clear local storage
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userDoc,
        loading,
        signUp,
        logIn,
        googleSignIn,
        logOut,
        deleteAccount,
        refreshUserDoc,
        saveProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
