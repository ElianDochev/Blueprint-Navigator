import { z } from "zod";

export const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMPORT_TYPES = ["application/pdf", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".png"];

function hasAllowedExtension(fileName: string): boolean {
  return ALLOWED_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));
}

export const importFileSchema = z
  .instanceof(File)
  .refine(
    (file) => ALLOWED_IMPORT_TYPES.includes(file.type) || hasAllowedExtension(file.name),
    "Only PDF and PNG files are allowed."
  )
  .refine(
    (file) => file.size <= MAX_FILE_SIZE_BYTES,
    `File size must be at most ${MAX_FILE_SIZE_MB}MB.`
  );

export function validateImportFile(file: File): { ok: boolean; error?: string } {
  const result = importFileSchema.safeParse(file);
  if (result.success) {
    return { ok: true };
  }

  return { ok: false, error: result.error.issues[0]?.message ?? "Invalid file." };
}
