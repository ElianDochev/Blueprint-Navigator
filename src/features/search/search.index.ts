import FlexSearch from "flexsearch";
import type { DrawingFile, DrawingPage } from "../drawings/drawings.types";
import { normalizeText } from "../../utils/text";

export interface IndexedPage {
  id: string;
  fileId: string;
  fileName: string;
  pageNumber: number;
  text: string;
  normalizedText: string;
}

export class SearchIndex {
  private readonly index = new FlexSearch.Index({
    tokenize: "forward",
    encode: "icase"
  });

  private readonly pageMap = new Map<string, IndexedPage>();

  clear() {
    this.index.clear();
    this.pageMap.clear();
  }

  rebuild(drawings: DrawingFile[], pages: DrawingPage[]) {
    this.clear();

    const fileNameById = new Map(drawings.map((drawing) => [drawing.id, drawing.fileName]));
    pages.forEach((page) => {
      const fileName = fileNameById.get(page.fileId) ?? "Unknown file";
      this.addPage(page, fileName);
    });
  }

  addPage(page: DrawingPage, fileName: string) {
    const indexedPage: IndexedPage = {
      id: page.id,
      fileId: page.fileId,
      fileName,
      pageNumber: page.pageNumber,
      text: page.text,
      normalizedText: page.normalizedText
    };

    if (this.pageMap.has(page.id)) {
      this.index.remove(page.id);
    }

    this.pageMap.set(page.id, indexedPage);
    this.index.add(page.id, `${normalizeText(fileName)} ${page.normalizedText}`);
  }

  searchIds(query: string, limit = 20): string[] {
    const normalized = normalizeText(query);
    if (!normalized) {
      return [];
    }

    return this.index.search(normalized, limit) as string[];
  }

  getPage(id: string): IndexedPage | undefined {
    return this.pageMap.get(id);
  }

  listPages(): IndexedPage[] {
    return [...this.pageMap.values()];
  }
}
