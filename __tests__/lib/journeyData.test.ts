import { STAGES, VALID_SLUGS, countValidStages } from "@/lib/journeyData";

describe("Journey Data Logic", () => {
  it("exports exactly 8 stages", () => {
    expect(STAGES).toHaveLength(8);
  });

  it("exports valid slugs correctly", () => {
    expect(VALID_SLUGS.size).toBe(8);
    expect(VALID_SLUGS.has("voter-registration")).toBe(true);
  });

  it("countValidStages counts only valid slugs", () => {
    const checked = ["voter-registration", "invalid-slug", "polling", "another-invalid"];
    expect(countValidStages(checked)).toBe(2);
  });
});
