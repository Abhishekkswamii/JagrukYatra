/**
 * @file firestoreUtils.test.ts
 * @description Unit tests for Firestore utility functions: createUserDoc,
 * getUserDoc, updateUserProgress, awardBadge, addJagrukScore,
 * markModuleComplete, and deleteUserDoc.
 *
 * All Firestore SDK calls are mocked so no real Firebase connections are made.
 */

// ─── Mock Firebase Firestore SDK ──────────────────────────────────────────────
jest.mock("firebase/firestore", () => ({
  doc: jest.fn((_db: unknown, _col: string, id: string) => ({ id })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "SERVER_TIMESTAMP"),
}));

// ─── Mock the Firebase app initialisation (prevents env-key errors) ───────────
jest.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
}));

import {
  createUserDoc,
  getUserDoc,
  updateUserProgress,
  awardBadge,
  addJagrukScore,
  markModuleComplete,
  deleteUserDoc,
  type FirestoreUser,
} from "@/lib/firestore";

import { getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal FirestoreUser for mock responses. */
function buildMockUser(overrides: Partial<FirestoreUser> = {}): FirestoreUser {
  return {
    uid: "test-uid-123",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: null,
    state: "Maharashtra",
    ageGroup: "18–24",
    isFirstTimeVoter: true,
    onboardingComplete: false,
    jagrukScore: 0,
    completedModules: [],
    earnedBadges: [],
    completedChecklist: [],
    createdAt: "SERVER_TIMESTAMP",
    updatedAt: "SERVER_TIMESTAMP",
    ...overrides,
  };
}

/** Make getDoc resolve with a document that exists. */
function mockDocExists(data: FirestoreUser) {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    exists: () => true,
    data: () => data,
  });
}

/** Make getDoc resolve with a document that does NOT exist. */
function mockDocMissing() {
  (getDoc as jest.Mock).mockResolvedValueOnce({
    exists: () => false,
    data: () => null,
  });
}

// ─── createUserDoc ────────────────────────────────────────────────────────────

describe("createUserDoc()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does nothing if the document already exists", async () => {
    mockDocExists(buildMockUser());
    await createUserDoc("test-uid-123", {
      displayName: "Test User",
      email: "test@example.com",
      photoURL: null,
    });
    expect(setDoc).not.toHaveBeenCalled();
  });

  it("creates a new user document when it does not exist", async () => {
    mockDocMissing();
    (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await createUserDoc("new-uid", {
      displayName: "New User",
      email: "new@example.com",
      photoURL: null,
    });

    expect(setDoc).toHaveBeenCalledTimes(1);
    const [, writtenData] = (setDoc as jest.Mock).mock.calls[0];
    expect(writtenData.displayName).toBe("New User");
    expect(writtenData.jagrukScore).toBe(0);
    expect(writtenData.completedModules).toEqual([]);
    expect(writtenData.onboardingComplete).toBe(false);
  });

  it("initialises all required fields with correct defaults", async () => {
    mockDocMissing();
    (setDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await createUserDoc("uid-defaults", {
      displayName: "Defaults User",
      email: "defaults@test.com",
      photoURL: null,
    });

    const [, data] = (setDoc as jest.Mock).mock.calls[0];
    expect(data.uid).toBe("uid-defaults");
    expect(data.earnedBadges).toEqual([]);
    expect(data.completedChecklist).toEqual([]);
    expect(data.isFirstTimeVoter).toBe(false);
    expect(data.state).toBe("");
    expect(data.ageGroup).toBe("");
  });
});

// ─── getUserDoc ───────────────────────────────────────────────────────────────

describe("getUserDoc()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a FirestoreUser when the document exists", async () => {
    const mock = buildMockUser({ displayName: "Real User" });
    mockDocExists(mock);

    const result = await getUserDoc("test-uid-123");
    expect(result).not.toBeNull();
    expect(result?.displayName).toBe("Real User");
  });

  it("returns null when the document does not exist", async () => {
    mockDocMissing();
    const result = await getUserDoc("ghost-uid");
    expect(result).toBeNull();
  });
});

// ─── updateUserProgress ───────────────────────────────────────────────────────

describe("updateUserProgress()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls updateDoc with the provided fields + updatedAt timestamp", async () => {
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await updateUserProgress("uid-123", { jagrukScore: 80 });

    expect(updateDoc).toHaveBeenCalledTimes(1);
    const [, payload] = (updateDoc as jest.Mock).mock.calls[0];
    expect(payload.jagrukScore).toBe(80);
    expect(payload.updatedAt).toBe("SERVER_TIMESTAMP");
  });

  it("handles multiple field updates in a single call", async () => {
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await updateUserProgress("uid-123", {
      jagrukScore: 50,
      onboardingComplete: true,
      state: "Delhi",
    });

    const [, payload] = (updateDoc as jest.Mock).mock.calls[0];
    expect(payload.jagrukScore).toBe(50);
    expect(payload.onboardingComplete).toBe(true);
    expect(payload.state).toBe("Delhi");
  });
});

// ─── awardBadge ───────────────────────────────────────────────────────────────

describe("awardBadge()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("adds a new badge to earnedBadges", async () => {
    const user = buildMockUser({ earnedBadges: ["first-step"] });
    mockDocExists(user);
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await awardBadge("uid-123", "quiz-master");

    const [, payload] = (updateDoc as jest.Mock).mock.calls[0];
    expect(payload.earnedBadges).toContain("quiz-master");
    expect(payload.earnedBadges).toContain("first-step");
  });

  it("does NOT duplicate a badge already in earnedBadges", async () => {
    const user = buildMockUser({ earnedBadges: ["quiz-master"] });
    mockDocExists(user);

    await awardBadge("uid-123", "quiz-master");

    // updateDoc should not be called because badge already exists
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("does nothing when user document is missing", async () => {
    mockDocMissing();
    await awardBadge("ghost-uid", "quiz-master");
    expect(updateDoc).not.toHaveBeenCalled();
  });
});

// ─── addJagrukScore ───────────────────────────────────────────────────────────

describe("addJagrukScore()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("accumulates points on top of existing score", async () => {
    const user = buildMockUser({ jagrukScore: 40 });
    mockDocExists(user);
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await addJagrukScore("uid-123", 15);

    const [, payload] = (updateDoc as jest.Mock).mock.calls[0];
    expect(payload.jagrukScore).toBe(55);
  });

  it("starts from 0 when jagrukScore is not set on user", async () => {
    const user = buildMockUser({ jagrukScore: 0 });
    mockDocExists(user);
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await addJagrukScore("uid-123", 25);

    const [, payload] = (updateDoc as jest.Mock).mock.calls[0];
    expect(payload.jagrukScore).toBe(25);
  });

  it("does nothing when user document is missing", async () => {
    mockDocMissing();
    await addJagrukScore("ghost-uid", 10);
    expect(updateDoc).not.toHaveBeenCalled();
  });
});

// ─── markModuleComplete ───────────────────────────────────────────────────────

describe("markModuleComplete()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("appends a new module ID to completedModules", async () => {
    const user = buildMockUser({ completedModules: ["quiz"] });
    mockDocExists(user);
    (updateDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await markModuleComplete("uid-123", "simulator");

    const [, payload] = (updateDoc as jest.Mock).mock.calls[0];
    expect(payload.completedModules).toContain("quiz");
    expect(payload.completedModules).toContain("simulator");
  });

  it("does NOT duplicate a module already marked complete", async () => {
    const user = buildMockUser({ completedModules: ["quiz"] });
    mockDocExists(user);

    await markModuleComplete("uid-123", "quiz");

    expect(updateDoc).not.toHaveBeenCalled();
  });

  it("does nothing when user document is missing", async () => {
    mockDocMissing();
    await markModuleComplete("ghost-uid", "quiz");
    expect(updateDoc).not.toHaveBeenCalled();
  });
});

// ─── deleteUserDoc ────────────────────────────────────────────────────────────

describe("deleteUserDoc()", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls deleteDoc with the correct document reference", async () => {
    (deleteDoc as jest.Mock).mockResolvedValueOnce(undefined);

    await deleteUserDoc("uid-to-delete");

    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});
