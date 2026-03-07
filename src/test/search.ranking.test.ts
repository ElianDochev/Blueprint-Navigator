import { describe, expect, it } from "vitest";
import { rankPage } from "../features/search/search.ranking";

describe("search ranking", () => {
  const candidate = {
    id: "page_1",
    fileId: "file_1",
    fileName: "BuildingB-Electrical.pdf",
    pageNumber: 2,
    text: "Electrical panel schedule and riser details",
    normalizedText: "electrical panel schedule and riser details"
  };

  it("assigns higher score for matching query", () => {
    const high = rankPage(candidate, "electrical panel");
    const low = rankPage(candidate, "plumbing");
    expect(high).toBeGreaterThan(low);
  });

  it("adds bonus for sheet-like queries", () => {
    const withSheet = {
      ...candidate,
      normalizedText: "sheet a-102 electrical panel schedule"
    };

    const score = rankPage(withSheet, "A-102");
    expect(score).toBeGreaterThan(3);
  });
});
