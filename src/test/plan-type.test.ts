import { describe, expect, it } from "vitest";
import { buildPlanTypeTags, inferPlanType } from "../features/drawings/plan-type";

describe("plan type lookup", () => {
  it("classifies electrical plans from filename/sheet pattern", () => {
    const planType = inferPlanType("BLDG-B_E-201.png", [""]);
    expect(planType).toBe("electrical");
  });

  it("classifies mechanical plans from extracted text", () => {
    const planType = inferPlanType("building-a-plan.pdf", ["Mechanical HVAC duct routing schedule"]);
    expect(planType).toBe("mechanical");
  });

  it("returns unknown for ambiguous data", () => {
    const planType = inferPlanType("scan-001.pdf", [""]);
    expect(planType).toBe("unknown");
  });

  it("builds searchable tags", () => {
    const tags = buildPlanTypeTags("fire_protection");
    expect(tags).toContain("fire_protection");
    expect(tags).toContain("fire protection");
  });
});
