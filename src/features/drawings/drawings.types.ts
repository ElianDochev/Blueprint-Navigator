export type DrawingSourceKind = "pdf" | "image";

export type PlanType =
  | "architectural"
  | "electrical"
  | "mechanical"
  | "plumbing"
  | "structural"
  | "civil"
  | "fire_protection"
  | "landscape"
  | "unknown";

export interface DrawingFile {
  id: string;
  projectName: string;
  fileName: string;
  fileHash: string;
  importedAt: string;
  pageCount: number;
  sourceKind: DrawingSourceKind;
  mimeType: string;
  planType: PlanType;
  tags?: string[];
}

export interface StoredDrawingFile extends DrawingFile {
  fileBlob: Blob;
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
  intent: "open_plan" | "open_file" | "find_sheet" | "search_text" | "unknown";
  building?: string;
  discipline?: string;
  fileName?: string;
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

export interface ImportCandidate {
  file: File;
  displayName: string;
}
