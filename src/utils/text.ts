export function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

export function makeSnippet(source: string, query: string, max = 160): string {
  const normalizedSource = source.replace(/\s+/g, " ").trim();
  if (!normalizedSource) {
    return "No text extracted from this page.";
  }

  const index = normalizedSource.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) {
    return normalizedSource.slice(0, max);
  }

  const half = Math.floor(max / 2);
  const start = Math.max(0, index - half);
  return normalizedSource.slice(start, start + max);
}
