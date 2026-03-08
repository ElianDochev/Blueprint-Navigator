import { normalizeText } from "../../utils/text";

export interface ParsedPlanQuery {
  intent: "find_plan" | "unknown";
  topic: string;
  projectName: string | null;
}

function heuristicParse(query: string): ParsedPlanQuery {
  const normalized = normalizeText(query);
  if (!normalized) {
    return { intent: "unknown", topic: "", projectName: null };
  }

  const withProject = normalized.match(/(?:plans?|plan)\s+for\s+project\s+(?<project>[a-z0-9 _-]+?)\s+(?<topic>[a-z0-9 _-]+)$/i);
  if (withProject?.groups?.project && withProject?.groups?.topic) {
    return {
      intent: "find_plan",
      projectName: withProject.groups.project.trim(),
      topic: withProject.groups.topic.trim()
    };
  }

  const generic = normalized.match(/(?:give me|show|find|open)?\s*(?:plans?|plan)\s+for\s+(?<topic>[a-z0-9 _-]+)/i);
  if (generic?.groups?.topic) {
    return {
      intent: "find_plan",
      projectName: null,
      topic: generic.groups.topic.trim()
    };
  }

  return {
    intent: "find_plan",
    projectName: null,
    topic: normalized
  };
}

function parseJson(content: string): ParsedPlanQuery | null {
  try {
    const parsed = JSON.parse(content) as Partial<ParsedPlanQuery>;
    if (parsed.intent !== "find_plan" && parsed.intent !== "unknown") {
      return null;
    }

    if (typeof parsed.topic !== "string") {
      return null;
    }

    const projectName = typeof parsed.projectName === "string" && parsed.projectName.trim() ? parsed.projectName.trim() : null;
    return {
      intent: parsed.intent,
      topic: parsed.topic.trim(),
      projectName
    };
  } catch {
    return null;
  }
}

export async function parsePlanQueryWithLlm(query: string): Promise<ParsedPlanQuery> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || "gpt-4o-mini";

  if (!apiKey) {
    return heuristicParse(query);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Return only JSON with shape {"intent":"find_plan"|"unknown","topic":"string","projectName":"string|null"} for blueprint search queries.'
          },
          {
            role: "user",
            content: query
          }
        ]
      })
    });

    if (!response.ok) {
      return heuristicParse(query);
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      return heuristicParse(query);
    }

    return parseJson(content) ?? heuristicParse(query);
  } catch {
    return heuristicParse(query);
  }
}
