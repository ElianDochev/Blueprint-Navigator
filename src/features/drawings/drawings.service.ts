import { validateImportFile } from "./drawings.validators";
import type { ImportCandidate, ImportProgress, Project } from "./drawings.types";
import { buildPlanTypeTags, inferPlanType } from "./plan-type";
import { extractPdfText, extractPngImage } from "../pdf/pdf.extractor";
import { saveDrawingWithPages } from "../storage/repositories";

export interface ImportReport {
  importedFiles: number;
  skippedFiles: Array<{ fileName: string; reason: string }>;
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function importDrawingFiles(
  files: ImportCandidate[],
  project: Project,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportReport> {
  const skippedFiles: Array<{ fileName: string; reason: string }> = [];
  let importedFiles = 0;

  for (let index = 0; index < files.length; index += 1) {
    const { file, displayName } = files[index];
    const normalizedDisplayName = displayName.trim() || file.name;
    const validation = validateImportFile(file);

    if (!validation.ok) {
      skippedFiles.push({ fileName: normalizedDisplayName, reason: validation.error ?? "Invalid file." });
      continue;
    }

    const extracted =
      isPdfFile(file)
        ? await extractPdfText(file, project.id, project.name, (currentPage, totalPages) => {
            onProgress?.({
              fileName: normalizedDisplayName,
              currentFileIndex: index + 1,
              totalFiles: files.length,
              currentPage,
              totalPages
            });
          })
        : await extractPngImage(file, project.id, project.name, (currentPage, totalPages) => {
            onProgress?.({
              fileName: normalizedDisplayName,
              currentFileIndex: index + 1,
              totalFiles: files.length,
              currentPage,
              totalPages
            });
          });

    extracted.drawing.fileName = normalizedDisplayName;
    const planType = inferPlanType(normalizedDisplayName, extracted.pages.map((page) => page.text));
    extracted.drawing.planType = planType;
    extracted.drawing.tags = [...new Set([...(extracted.drawing.tags ?? []), ...buildPlanTypeTags(planType)])];

    await saveDrawingWithPages({ ...extracted.drawing, fileBlob: extracted.fileBlob }, extracted.pages);
    importedFiles += 1;
  }

  return {
    importedFiles,
    skippedFiles
  };
}
