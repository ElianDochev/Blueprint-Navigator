import { z } from "zod";

export const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const importFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "application/pdf", "Only PDF files are allowed.")
  .refine(
    (file) => file.size <= MAX_FILE_SIZE_BYTES,
    `PDF size must be at most ${MAX_FILE_SIZE_MB}MB.`
  );

export function validateImportFile(file: File): { ok: boolean; error?: string } {
  const result = importFileSchema.safeParse(file);
  if (result.success) {
    return { ok: true };
  }

  return { ok: false, error: result.error.issues[0]?.message ?? "Invalid file." };
}
