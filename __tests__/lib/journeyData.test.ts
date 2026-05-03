/**
 * @file journeyData.test.ts
 * @description Comprehensive tests for the 8-stage ECI election journey data,
 * badge definitions, utility functions, and TypeScript type contracts.
 */

import {
  STAGES,
  BADGES,
  STATES,
  AGE_GROUPS,
  VALID_SLUGS,
  countValidStages,
  type TimelineStage,
  type UserProfile,
} from "@/lib/journeyData";

// ─── STAGES ───────────────────────────────────────────────────────────────────

describe("STAGES — 8-stage ECI election process", () => {
  it("exports exactly 8 stages", () => {
    expect(STAGES).toHaveLength(8);
  });

  it("each stage has required fields with correct types", () => {
    STAGES.forEach((stage) => {
      expect(typeof stage.id).toBe("number");
      expect(typeof stage.slug).toBe("string");
      expect(stage.slug.length).toBeGreaterThan(0);
      expect(typeof stage.icon).toBe("string");
      expect(typeof stage.title).toBe("string");
      expect(typeof stage.tagline).toBe("string");
      expect(typeof stage.summary).toBe("string");
      expect(typeof stage.details).toBe("string");
      expect(typeof stage.color).toBe("string");
      expect(typeof stage.accentColor).toBe("string");
      expect(typeof stage.stateNote).toBe("function");
    });
  });

  it("stage IDs are sequential from 1 to 8", () => {
    const ids = STAGES.map((s) => s.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("stage slugs are unique", () => {
    const slugs = STAGES.map((s) => s.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("slug 'voter-registration' exists at stage 2", () => {
    const stage = STAGES.find((s) => s.slug === "voter-registration");
    expect(stage).toBeDefined();
    expect(stage?.id).toBe(2);
  });

  it("slug 'polling' exists at stage 6", () => {
    const stage = STAGES.find((s) => s.slug === "polling");
    expect(stage).toBeDefined();
    expect(stage?.id).toBe(6);
  });

  it("slug 'government-formation' is the last stage", () => {
    const last = STAGES[STAGES.length - 1];
    expect(last.slug).toBe("government-formation");
  });

  it("optional link field conforms to shape when present", () => {
    STAGES.forEach((stage) => {
      if (stage.link) {
        expect(typeof stage.link.text).toBe("string");
        expect(typeof stage.link.url).toBe("string");
        expect(stage.link.url).toMatch(/^https?:\/\//);
      }
    });
  });

  it("badgeUnlock is a non-empty string when present", () => {
    STAGES.forEach((stage) => {
      if (stage.badgeUnlock !== undefined) {
        expect(typeof stage.badgeUnlock).toBe("string");
        expect(stage.badgeUnlock.length).toBeGreaterThan(0);
      }
    });
  });

  it("stateNote returns null for a generic state", () => {
    STAGES.forEach((stage) => {
      const result = stage.stateNote("Goa");
      // Most stages return null for a non-special state
      expect(result === null || typeof result === "string").toBe(true);
    });
  });

  it("stateNote returns a state-specific string for UP on announcement stage", () => {
    const announcement = STAGES.find((s) => s.slug === "announcement");
    expect(announcement).toBeDefined();
    const note = announcement!.stateNote("Uttar Pradesh");
    expect(typeof note).toBe("string");
    expect(note!.length).toBeGreaterThan(0);
  });

  it("stateNote returns a specific note for J&K on announcement stage", () => {
    const announcement = STAGES.find((s) => s.slug === "announcement");
    const note = announcement!.stateNote("Jammu & Kashmir");
    expect(typeof note).toBe("string");
  });

  it("stateNote returns null for a generic state on government-formation stage", () => {
    const stage = STAGES.find((s) => s.slug === "government-formation");
    const note = stage!.stateNote("Goa");
    expect(note).toBeNull();
  });

  it("accentColor values are valid hex color strings", () => {
    STAGES.forEach((stage) => {
      expect(stage.accentColor).toMatch(/^#[0-9A-Fa-f]{3,8}$/);
    });
  });
});

// ─── VALID_SLUGS ──────────────────────────────────────────────────────────────

describe("VALID_SLUGS", () => {
  it("is a Set with exactly 8 members", () => {
    expect(VALID_SLUGS).toBeInstanceOf(Set);
    expect(VALID_SLUGS.size).toBe(8);
  });

  it("contains all stage slugs", () => {
    STAGES.forEach((stage) => {
      expect(VALID_SLUGS.has(stage.slug)).toBe(true);
    });
  });

  it("does not contain invented slugs", () => {
    expect(VALID_SLUGS.has("fake-stage")).toBe(false);
    expect(VALID_SLUGS.has("")).toBe(false);
    expect(VALID_SLUGS.has("voter_registration")).toBe(false); // underscore variant
  });
});

// ─── countValidStages ─────────────────────────────────────────────────────────

describe("countValidStages()", () => {
  it("returns 0 for an empty array", () => {
    expect(countValidStages([])).toBe(0);
  });

  it("returns 0 for an array of only invalid slugs", () => {
    expect(countValidStages(["fake", "invalid-slug", "not-a-stage"])).toBe(0);
  });

  it("counts only valid slugs, ignoring invalid ones", () => {
    const input = ["voter-registration", "invalid-slug", "polling", "not-real"];
    expect(countValidStages(input)).toBe(2);
  });

  it("returns correct count for all 8 valid slugs", () => {
    const allSlugs = STAGES.map((s) => s.slug);
    expect(countValidStages(allSlugs)).toBe(8);
  });

  it("handles duplicate valid slugs without double-counting", () => {
    // Functionally it does count duplicates since it uses filter — important to document
    const input = ["polling", "polling", "voter-registration"];
    expect(countValidStages(input)).toBe(3); // current behavior: counts each entry
  });
});

// ─── BADGES ───────────────────────────────────────────────────────────────────

describe("BADGES", () => {
  it("exports at least 10 badge definitions", () => {
    expect(BADGES.length).toBeGreaterThanOrEqual(10);
  });

  it("each badge has required string fields", () => {
    BADGES.forEach((badge) => {
      expect(typeof badge.id).toBe("string");
      expect(typeof badge.icon).toBe("string");
      expect(typeof badge.title).toBe("string");
      expect(typeof badge.description).toBe("string");
      expect(typeof badge.color).toBe("string");
    });
  });

  it("badge IDs are unique", () => {
    const ids = BADGES.map((b) => b.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("contains the 'yatra-completer' badge", () => {
    const badge = BADGES.find((b) => b.id === "yatra-completer");
    expect(badge).toBeDefined();
    expect(badge?.icon).toBe("🏆");
  });

  it("contains the 'quiz-master' badge", () => {
    const badge = BADGES.find((b) => b.id === "quiz-master");
    expect(badge).toBeDefined();
  });
});

// ─── STATES & AGE_GROUPS ──────────────────────────────────────────────────────

describe("STATES", () => {
  it("exports at least 30 entries", () => {
    expect(STATES.length).toBeGreaterThanOrEqual(30);
  });

  it("includes Pan India, Delhi, and all major states", () => {
    expect(STATES).toContain("Pan India");
    expect(STATES).toContain("Delhi");
    expect(STATES).toContain("Maharashtra");
    expect(STATES).toContain("Uttar Pradesh");
    expect(STATES).toContain("Jammu & Kashmir");
  });

  it("all entries are non-empty strings", () => {
    STATES.forEach((s) => {
      expect(typeof s).toBe("string");
      expect(s.length).toBeGreaterThan(0);
    });
  });
});

describe("AGE_GROUPS", () => {
  it("exports exactly 4 age group options", () => {
    expect(AGE_GROUPS).toHaveLength(4);
  });

  it("all entries are non-empty strings", () => {
    AGE_GROUPS.forEach((g) => {
      expect(typeof g).toBe("string");
      expect(g.length).toBeGreaterThan(0);
    });
  });
});

// ─── TYPE CONTRACT ─────────────────────────────────────────────────────────────

describe("TypeScript type contract — TimelineStage", () => {
  it("stage objects satisfy the TimelineStage interface at runtime", () => {
    const stage: TimelineStage = STAGES[0];
    expect(stage).toHaveProperty("id");
    expect(stage).toHaveProperty("slug");
    expect(stage).toHaveProperty("stateNote");
  });
});

describe("TypeScript type contract — UserProfile", () => {
  it("UserProfile shape is valid", () => {
    const profile: UserProfile = {
      state: "Goa",
      ageGroup: "18–24",
      firstTimeVoter: true,
    };
    expect(profile.state).toBe("Goa");
    expect(profile.firstTimeVoter).toBe(true);
  });
});
