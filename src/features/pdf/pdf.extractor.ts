import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { DrawingFile, DrawingPage } from "../drawings/drawings.types";
import { normalizeText } from "../../utils/text";

GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export interface ExtractedDrawing {
  drawing: DrawingFile;
  pages: DrawingPage[];
  fileBlob: Blob;
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function hashBytes(content: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", content);
  return [...new Uint8Array(hashBuffer)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function extractPdfText(
  file: File,
  projectId: string,
  projectName: string,
  onPage?: (currentPage: number, totalPages: number) => void
): Promise<ExtractedDrawing> {
  const bytes = await file.arrayBuffer();
  const fileHash = await hashBytes(bytes);
  const pdfTask = getDocument({ data: bytes });
  const pdf = await pdfTask.promise;

  const fileId = createId("file");
  const pages: DrawingPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: { str?: string }) => item.str ?? "")
      .join(" ")
      .trim();

    pages.push({
      id: createId("page"),
      fileId,
      pageNumber,
      text,
      normalizedText: normalizeText(text)
    });

    onPage?.(pageNumber, pdf.numPages);
  }

  const drawing: DrawingFile = {
    id: fileId,
    projectId,
    projectName,
    fileName: file.name,
    fileHash,
    importedAt: new Date().toISOString(),
    pageCount: pdf.numPages,
    sourceKind: "pdf",
    mimeType: file.type || "application/pdf",
    planType: "unknown",
    tags: []
  };

  await pdf.destroy();

  return {
    drawing,
    pages,
    fileBlob: new Blob([bytes], { type: "application/pdf" })
  };
}

export async function extractPngImage(
  file: File,
  projectId: string,
  projectName: string,
  onPage?: (currentPage: number, totalPages: number) => void
): Promise<ExtractedDrawing> {
  const bytes = await file.arrayBuffer();
  const fileHash = await hashBytes(bytes);
  const fileId = createId("file");

  const page: DrawingPage = {
    id: createId("page"),
    fileId,
    pageNumber: 1,
    text: "",
    normalizedText: ""
  };

  onPage?.(1, 1);

  return {
    drawing: {
      id: fileId,
      projectId,
      projectName,
      fileName: file.name,
      fileHash,
      importedAt: new Date().toISOString(),
      pageCount: 1,
      sourceKind: "image",
      mimeType: file.type || "image/png",
      planType: "unknown",
      tags: []
    },
    pages: [page],
    fileBlob: new Blob([bytes], { type: file.type || "image/png" })
  };
}
