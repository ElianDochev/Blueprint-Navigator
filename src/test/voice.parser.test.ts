import { describe, expect, it } from "vitest";
import { parseVoiceCommand } from "../features/voice/voice.parser";

describe("voice parser", () => {
  it("parses open file command", () => {
    const result = parseVoiceCommand("give me plan for file lobby-level");
    expect(result.intent).toBe("open_file");
    expect(result.fileName).toBe("lobby-level");
  });

  it("parses open plan command", () => {
    const result = parseVoiceCommand("open plan for Building X");
    expect(result.intent).toBe("open_plan");
    expect(result.building).toBe("x");
  });

  it("parses discipline command", () => {
    const result = parseVoiceCommand("show electrical plan for Building B");
    expect(result.intent).toBe("open_plan");
    expect(result.discipline).toBe("electrical");
    expect(result.building).toBe("b");
  });

  it("parses sheet command", () => {
    const result = parseVoiceCommand("find sheet A-102");
    expect(result.intent).toBe("find_sheet");
    expect(result.sheet).toBe("A-102");
  });

  it("falls back to text search", () => {
    const result = parseVoiceCommand("show me the lobby details");
    expect(result.intent).toBe("search_text");
    expect(result.query).toContain("lobby");
  });
});
