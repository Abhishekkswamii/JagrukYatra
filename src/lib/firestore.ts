/**
 * @file firestore.ts
 * @description Firestore data access layer for JagrukYatra.
 * Provides typed CRUD helpers for the users/{uid} collection.
 * All writes include a server-side `updatedAt` timestamp for audit trails.
 */

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
/**
 * Firestore document shape for a user.
 * Stored at: `users/{uid}`
 */
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

/**
 * Subset of FirestoreUser fields that can be partially updated
 * via `updateUserProgress()`. Prevents accidental overwrites of
 * immutable fields like `uid`, `email`, or `createdAt`.
 */
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

/**
 * Creates a new user document in Firestore on first sign-up.
 * Idempotent — if the document already exists, it is not overwritten.
 *
 * @param uid  - Firebase Auth UID (document ID)
 * @param data - Display name, email, and photo URL from the auth provider
 */
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

/**
 * Fetches a user document from Firestore.
 *
 * @param uid - Firebase Auth UID
 * @returns   The typed FirestoreUser or `null` if not found
 */
export async function getUserDoc(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

/**
 * Partially updates a user document. Always stamps `updatedAt` with the
 * Firestore server timestamp to keep the audit trail accurate.
 *
 * @param uid     - Firebase Auth UID
 * @param updates - Partial set of mutable user fields to overwrite
 */
export async function updateUserProgress(
  uid: string,
  updates: ProgressUpdate
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Awards a badge to the user idempotently.
 * If the badge is already in `earnedBadges`, the Firestore write is skipped.
 *
 * @param uid     - Firebase Auth UID
 * @param badgeId - Badge identifier from the `BADGES` array in journeyData.ts
 */
export async function awardBadge(uid: string, badgeId: string): Promise<void> {
  const user = await getUserDoc(uid);
  if (!user) return;
  if (user.earnedBadges.includes(badgeId)) return;
  await updateUserProgress(uid, {
    earnedBadges: [...user.earnedBadges, badgeId],
  });
}

/**
 * Atomically adds points to the user's Jagruk Score.
 * Points accumulate on top of the existing score; the score is never reset here.
 *
 * @param uid    - Firebase Auth UID
 * @param points - Number of points to add (should be positive)
 */
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

/**
 * Marks a feature module (e.g. "quiz", "simulator") as completed.
 * Idempotent — the module ID is never duplicated in the array.
 *
 * @param uid      - Firebase Auth UID
 * @param moduleId - Module identifier string (e.g. "quiz", "myth-buster")
 */
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

/**
 * Permanently deletes a user's Firestore document.
 * Called immediately before `deleteUser()` from Firebase Auth during account deletion.
 *
 * @param uid - Firebase Auth UID
 */
export async function deleteUserDoc(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

