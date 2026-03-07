export interface DrawingFile {
  id: string;
  projectName: string;
  fileName: string;
  fileHash: string;
  importedAt: string;
  pageCount: number;
  tags?: string[];
}

export interface StoredDrawingFile extends DrawingFile {
  pdfBlob: Blob;
}

export interface DrawingPage {
  id: string;
  fileId: string;
  pageNumber: number;
  text: string;
  normalizedText: string;
}

export interface SearchResult {
  fileId: string;
  fileName: string;
  pageNumber: number;
  score: number;
  snippet: string;
}

export interface VoiceCommand {
  rawText: string;
  intent: "open_plan" | "find_sheet" | "search_text" | "unknown";
  building?: string;
  discipline?: string;
  sheet?: string;
  query?: string;
}

export interface ImportProgress {
  fileName: string;
  currentFileIndex: number;
  totalFiles: number;
  currentPage: number;
  totalPages: number;
}
