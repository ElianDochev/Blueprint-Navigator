import { describe, expect, it } from "vitest";
import { buildRecentQueries } from "../features/storage/repositories";

describe("storage helpers", () => {
  it("deduplicates and prepends incoming query", () => {
    const result = buildRecentQueries(["electrical", "plumbing"], "plumbing");
    expect(result).toEqual(["plumbing", "electrical"]);
  });

  it("enforces max history length", () => {
    const existing = Array.from({ length: 12 }, (_, index) => `q-${index}`);
    const result = buildRecentQueries(existing, "new");
    expect(result).toHaveLength(8);
    expect(result[0]).toBe("new");
  });
});
