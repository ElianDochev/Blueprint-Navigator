import { tokenize } from "../../utils/text";
import type { IndexedPage } from "./search.index";

export function rankPage(page: IndexedPage, query: string): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return 0;
  }

  const pageText = page.normalizedText;
  const projectName = page.projectName.toLowerCase();
  const fileName = page.fileName.toLowerCase();
  const tags = page.tags.join(" ").toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (pageText.includes(token)) {
      score += 2;
    }

    if (fileName.includes(token)) {
      score += 1;
    }

    if (projectName.includes(token)) {
      score += 1;
    }

    if (tags.includes(token)) {
      score += 2;
    }
  }

  const sheetLike = /[a-z]-?\d{2,3}/i;
  if (sheetLike.test(query) && pageText.includes(query.toLowerCase())) {
    score += 3;
  }

  const densityBonus = Math.min(pageText.length / 1200, 1);
  return Number((score + densityBonus).toFixed(4));
}
