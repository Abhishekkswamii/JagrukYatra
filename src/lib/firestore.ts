import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/* ─────────────────────────────────────────
   Firestore shape for a user document
   Collection: users/{uid}
───────────────────────────────────────── */
export interface FirestoreUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  // Onboarding profile
  state: string;
  ageGroup: string;
  isFirstTimeVoter: boolean;
  onboardingComplete: boolean;
  // Progress
  jagrukScore: number;
  completedModules: string[];   // e.g. ["quiz", "simulator", "myth-buster"]
  earnedBadges: string[];       // badge IDs from BADGES array
  completedChecklist: string[]; // checklist item IDs ticked in Journey
  // Meta
  createdAt: unknown;
  updatedAt: unknown;
}

export type ProgressUpdate = Partial<
  Pick<
    FirestoreUser,
    | "jagrukScore"
    | "completedModules"
    | "earnedBadges"
    | "completedChecklist"
    | "state"
    | "ageGroup"
    | "isFirstTimeVoter"
    | "onboardingComplete"
  >
>;

/* ─── Create user doc on first sign-up ─── */
export async function createUserDoc(
  uid: string,
  data: Pick<FirestoreUser, "displayName" | "email" | "photoURL">
): Promise<void> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return; // already created

  const initial: FirestoreUser = {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
    state: "",
    ageGroup: "",
    isFirstTimeVoter: false,
    onboardingComplete: false,
    jagrukScore: 0,
    completedModules: [],
    earnedBadges: [],
    completedChecklist: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, initial);
}

/* ─── Fetch user doc ─── */
export async function getUserDoc(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

/* ─── Partial update helper ─── */
export async function updateUserProgress(
  uid: string,
  updates: ProgressUpdate
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/* ─── Award a badge (idempotent) ─── */
export async function awardBadge(uid: string, badgeId: string): Promise<void> {
  const user = await getUserDoc(uid);
  if (!user) return;
  if (user.earnedBadges.includes(badgeId)) return;
  await updateUserProgress(uid, {
    earnedBadges: [...user.earnedBadges, badgeId],
  });
}

/* ─── Add points ─── */
export async function addJagrukScore(
  uid: string,
  points: number
): Promise<void> {
  const user = await getUserDoc(uid);
  if (!user) return;
  await updateUserProgress(uid, {
    jagrukScore: (user.jagrukScore ?? 0) + points,
  });
}

/* ─── Mark module complete ─── */
export async function markModuleComplete(
  uid: string,
  moduleId: string
): Promise<void> {
  const user = await getUserDoc(uid);
  if (!user) return;
  if (user.completedModules.includes(moduleId)) return;
  await updateUserProgress(uid, {
    completedModules: [...user.completedModules, moduleId],
  });
}

/* ─── Delete user doc ─── */
export async function deleteUserDoc(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

