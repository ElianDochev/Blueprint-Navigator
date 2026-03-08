import type { VoiceCommand } from "../drawings/drawings.types";
import { normalizeText } from "../../utils/text";

export function parseVoiceCommand(rawText: string): VoiceCommand {
  const normalized = normalizeText(rawText);

  const filePlanMatch = normalized.match(/(?:give me|open|show)\s+(?:the\s+)?plan\s+for\s+file\s+(?<file>[a-z0-9._ -]+)/i);
  if (filePlanMatch?.groups?.file) {
    const fileName = filePlanMatch.groups.file.trim();
    return {
      rawText,
      intent: "open_file",
      fileName,
      query: fileName
    };
  }

  const openPlanMatch = normalized.match(/open\s+(?<discipline>[a-z]+\s+)?plan\s+for\s+building\s+(?<building>[a-z0-9-]+)/i);
  if (openPlanMatch?.groups?.building) {
    return {
      rawText,
      intent: "open_plan",
      discipline: openPlanMatch.groups.discipline?.trim(),
      building: openPlanMatch.groups.building,
      query: normalized
    };
  }

  const showPlanMatch = normalized.match(/show\s+(?<discipline>[a-z]+)\s+plan\s+for\s+building\s+(?<building>[a-z0-9-]+)/i);
  if (showPlanMatch?.groups?.building) {
    return {
      rawText,
      intent: "open_plan",
      discipline: showPlanMatch.groups.discipline,
      building: showPlanMatch.groups.building,
      query: normalized
    };
  }

  const sheetMatch = normalized.match(/find\s+sheet\s+(?<sheet>[a-z]-?\d{2,3})/i);
  if (sheetMatch?.groups?.sheet) {
    return {
      rawText,
      intent: "find_sheet",
      sheet: sheetMatch.groups.sheet.toUpperCase(),
      query: sheetMatch.groups.sheet
    };
  }

  if (normalized.length > 0) {
    return {
      rawText,
      intent: "search_text",
      query: normalized
    };
  }

  return {
    rawText,
    intent: "unknown"
  };
}
