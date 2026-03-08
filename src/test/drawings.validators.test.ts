import { describe, expect, it } from "vitest";
import { validateImportFile } from "../features/drawings/drawings.validators";

describe("drawing validators", () => {
  it("accepts valid PDFs", () => {
    const file = new File(["pdf-content"], "plan.pdf", { type: "application/pdf" });
    const result = validateImportFile(file);
    expect(result.ok).toBe(true);
  });

  it("accepts valid PNGs", () => {
    const file = new File(["png-content"], "plan.png", { type: "image/png" });
    const result = validateImportFile(file);
    expect(result.ok).toBe(true);
  });

  it("rejects non-pdf files", () => {
    const file = new File(["text"], "notes.txt", { type: "text/plain" });
    const result = validateImportFile(file);
    expect(result.ok).toBe(false);
    expect(result.error).toContain("Only PDF and PNG");
  });
});
