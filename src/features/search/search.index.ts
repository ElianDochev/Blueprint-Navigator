import FlexSearch from "flexsearch";
import type { DrawingFile, DrawingPage } from "../drawings/drawings.types";
import { normalizeText } from "../../utils/text";

export interface IndexedPage {
  id: string;
  fileId: string;
  projectId: string;
  projectName: string;
  fileName: string;
  tags: string[];
  pageNumber: number;
  text: string;
  normalizedText: string;
}

export class SearchIndex {
  private readonly index = new FlexSearch.Index({
    tokenize: "forward"
  });

  private readonly pageMap = new Map<string, IndexedPage>();
  private indexHealthy = true;

  clear() {
    try {
      this.index.clear();
      this.indexHealthy = true;
    } catch {
      this.indexHealthy = false;
    }

    this.pageMap.clear();
  }

  rebuild(drawings: DrawingFile[], pages: DrawingPage[]) {
    this.clear();

    const drawingById = new Map(drawings.map((drawing) => [drawing.id, drawing]));
    pages.forEach((page) => {
      const drawing = drawingById.get(page.fileId);
      this.addPage(
        page,
        drawing?.projectId ?? "unknown-project",
        drawing?.projectName ?? "Unknown project",
        drawing?.fileName ?? "Unknown file",
        drawing?.tags ?? []
      );
    });
  }

  addPage(page: DrawingPage, projectId: string, projectName: string, fileName: string, tags: string[]) {
    const indexedPage: IndexedPage = {
      id: page.id,
      fileId: page.fileId,
      projectId,
      projectName,
      fileName,
      tags,
      pageNumber: page.pageNumber,
      text: page.text,
      normalizedText: page.normalizedText
    };

    if (this.pageMap.has(page.id)) {
      if (this.indexHealthy) {
        try {
          this.index.remove(page.id);
        } catch {
          this.indexHealthy = false;
        }
      }
    }

    this.pageMap.set(page.id, indexedPage);
    if (this.indexHealthy) {
      try {
        const payload = `${normalizeText(projectName)} ${normalizeText(fileName)} ${normalizeText(tags.join(" "))} ${page.normalizedText}`.trim();
        this.index.add(page.id, payload || `${normalizeText(projectName)} ${normalizeText(fileName)}`);
      } catch {
        this.indexHealthy = false;
      }
    }
  }

  searchIds(query: string, limit = 20): string[] {
    const normalized = normalizeText(query);
    if (!normalized || !this.indexHealthy) {
      return [];
    }

    try {
      return this.index.search(normalized, limit) as string[];
    } catch {
      this.indexHealthy = false;
      return [];
    }
  }

  getPage(id: string): IndexedPage | undefined {
    return this.pageMap.get(id);
  }

  listPages(): IndexedPage[] {
    return [...this.pageMap.values()];
  }
}
