import type { DrawingFile, DrawingPage, SearchResult, VoiceCommand } from "../drawings/drawings.types";
import { makeSnippet, normalizeText } from "../../utils/text";
import { SearchIndex } from "./search.index";
import { rankPage } from "./search.ranking";

export class SearchService {
  private readonly index = new SearchIndex();

  hydrate(drawings: DrawingFile[], pages: DrawingPage[]) {
    this.index.rebuild(drawings, pages);
  }

  searchText(query: string, limit = 12): SearchResult[] {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) {
      return [];
    }

    const candidateIds = this.index.searchIds(normalizedQuery, limit * 3);
    const candidatePages =
      candidateIds.length > 0
        ? candidateIds
            .map((id) => this.index.getPage(id))
            .filter((value): value is NonNullable<typeof value> => Boolean(value))
        : this.index
            .listPages()
            .filter(
              (page) =>
                page.normalizedText.includes(normalizedQuery) ||
                page.projectName.toLowerCase().includes(normalizedQuery) ||
                page.fileName.toLowerCase().includes(normalizedQuery) ||
                page.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
            );

    return candidatePages
      .map((page) => ({
        projectId: page.projectId,
        projectName: page.projectName,
        fileId: page.fileId,
        fileName: page.fileName,
        pageNumber: page.pageNumber,
        score: rankPage(page, normalizedQuery),
        snippet: makeSnippet(page.text, normalizedQuery)
      }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  searchFromVoiceCommand(command: VoiceCommand): SearchResult[] {
    if (command.intent === "open_file" && command.fileName) {
      return this.searchText(command.fileName);
    }

    if (command.intent === "find_sheet" && command.sheet) {
      return this.searchText(command.sheet);
    }

    if (command.intent === "open_plan") {
      const terms = [command.discipline, "plan", command.building].filter(Boolean).join(" ");
      return this.searchText(terms || command.rawText);
    }

    if (command.intent === "search_text" && command.query) {
      return this.searchText(command.query);
    }

    return this.searchText(command.rawText);
  }
}
