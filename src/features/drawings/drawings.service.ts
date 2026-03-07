import { validateImportFile } from "./drawings.validators";
import type { ImportProgress } from "./drawings.types";
import { extractPdfText } from "../pdf/pdf.extractor";
import { saveDrawingWithPages } from "../storage/repositories";

export interface ImportReport {
  importedFiles: number;
  skippedFiles: Array<{ fileName: string; reason: string }>;
}

export async function importDrawingFiles(
  files: File[],
  projectName: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportReport> {
  const skippedFiles: Array<{ fileName: string; reason: string }> = [];
  let importedFiles = 0;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const validation = validateImportFile(file);

    if (!validation.ok) {
      skippedFiles.push({ fileName: file.name, reason: validation.error ?? "Invalid file." });
      continue;
    }

    const extracted = await extractPdfText(file, projectName, (currentPage, totalPages) => {
      onProgress?.({
        fileName: file.name,
        currentFileIndex: index + 1,
        totalFiles: files.length,
        currentPage,
        totalPages
      });
    });

    await saveDrawingWithPages({ ...extracted.drawing, pdfBlob: extracted.pdfBlob }, extracted.pages);
    importedFiles += 1;
  }

  return {
    importedFiles,
    skippedFiles
  };
}
