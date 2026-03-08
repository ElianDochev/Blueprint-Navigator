import type { PlanType } from "./drawings.types";
import { normalizeText } from "../../utils/text";

interface PlanTypeRule {
  type: Exclude<PlanType, "unknown">;
  keywords: string[];
  sheetPrefixes: string[];
}

const PLAN_TYPE_RULES: PlanTypeRule[] = [
  {
    type: "architectural",
    keywords: ["architectural", "floor plan", "elevation", "partition", "door schedule", "reflected ceiling", "rcp"],
    sheetPrefixes: ["A", "AD", "AS"]
  },
  {
    type: "electrical",
    keywords: ["electrical", "lighting", "power plan", "panel schedule", "single line", "one line", "circuit"],
    sheetPrefixes: ["E"]
  },
  {
    type: "mechanical",
    keywords: ["mechanical", "hvac", "duct", "ahu", "rtu", "air handling", "ventilation"],
    sheetPrefixes: ["M"]
  },
  {
    type: "plumbing",
    keywords: ["plumbing", "sanitary", "domestic water", "storm drain", "waste", "vent"],
    sheetPrefixes: ["P"]
  },
  {
    type: "structural",
    keywords: ["structural", "foundation", "framing", "rebar", "concrete", "steel"],
    sheetPrefixes: ["S"]
  },
  {
    type: "civil",
    keywords: ["civil", "grading", "site plan", "erosion", "utility plan", "drainage"],
    sheetPrefixes: ["C"]
  },
  {
    type: "fire_protection",
    keywords: ["fire protection", "sprinkler", "fire alarm", "standpipe"],
    sheetPrefixes: ["FP", "F"]
  },
  {
    type: "landscape",
    keywords: ["landscape", "irrigation", "planting"],
    sheetPrefixes: ["L"]
  }
];

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  architectural: "Architectural",
  electrical: "Electrical",
  mechanical: "Mechanical",
  plumbing: "Plumbing",
  structural: "Structural",
  civil: "Civil",
  fire_protection: "Fire Protection",
  landscape: "Landscape",
  unknown: "Unknown"
};

function collectSheetPrefixes(input: string): string[] {
  const matches = input.matchAll(/(?:^|[^A-Z0-9])([A-Z]{1,2})-?\d{2,4}\b/g);
  const prefixes = new Set<string>();
  for (const match of matches) {
    if (match[1]) {
      prefixes.add(match[1]);
    }
  }
  return [...prefixes];
}

export function inferPlanType(fileName: string, pageTexts: string[]): PlanType {
  const merged = normalizeText([fileName, ...pageTexts].join(" "));
  if (!merged) {
    return "unknown";
  }

  const upperMerged = merged.toUpperCase();
  const foundPrefixes = collectSheetPrefixes(upperMerged);

  let winner: PlanType = "unknown";
  let winnerScore = 0;

  for (const rule of PLAN_TYPE_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (merged.includes(keyword)) {
        score += keyword.includes(" ") ? 3 : 2;
      }
    }

    for (const prefix of rule.sheetPrefixes) {
      if (foundPrefixes.includes(prefix)) {
        score += 3;
      }
    }

    if (score > winnerScore) {
      winner = rule.type;
      winnerScore = score;
    }
  }

  return winner;
}

export function buildPlanTypeTags(planType: PlanType): string[] {
  if (planType === "unknown") {
    return ["plan", "unknown"];
  }

  return ["plan", planType, planType.replace("_", " "), `${planType} plan`];
}

export function planTypeLabel(planType: PlanType): string {
  return PLAN_TYPE_LABELS[planType];
}
