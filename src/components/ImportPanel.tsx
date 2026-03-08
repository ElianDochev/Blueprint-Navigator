import { useState, type ChangeEvent } from "react";
import type { ImportCandidate, ImportProgress } from "../features/drawings/drawings.types";

interface ImportPanelProps {
  importing: boolean;
  progress: ImportProgress | null;
  projectName?: string;
  onImport: (files: ImportCandidate[], projectName: string) => Promise<void>;
}

export function ImportPanel({ importing, progress, projectName, onImport }: ImportPanelProps) {
  const [projectNameInput, setProjectNameInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files;

    if (!selected || selected.length === 0) {
      return;
    }

    const resolvedProjectName = projectName ?? projectNameInput;
    if (!resolvedProjectName.trim()) {
      setLocalError("Project name is required before importing.");
      return;
    }

    setLocalError(null);
    const files = Array.from(selected).map((file) => {
      const typedName = window.prompt(`How would you like to name "${file.name}"?`, file.name);
      const displayName = typedName?.trim() || file.name;

      return {
        file,
        displayName
      };
    });

    await onImport(files, resolvedProjectName.trim());

    event.target.value = "";
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Import Drawings</h2>
      <p className="mt-1 text-sm text-slate-600">Upload PDF/PNG files. You can rename each file before import.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        {projectName ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Uploading to: <strong>{projectName}</strong>
          </div>
        ) : (
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Project name
            <input
              type="text"
              value={projectNameInput}
              onChange={(event) => setProjectNameInput(event.target.value)}
              placeholder="Building A Renovation"
              className="rounded-lg border border-slate-300 px-3 py-2"
              disabled={importing}
            />
          </label>
        )}

        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
          <input
            type="file"
            accept="application/pdf,image/png"
            multiple
            className="hidden"
            onChange={handleFileInput}
            disabled={importing}
          />
          {importing ? "Importing..." : "Select PDF/PNGs"}
        </label>
      </div>

      {localError ? <p className="mt-3 text-sm text-rose-700">{localError}</p> : null}

      {progress ? (
        <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <p>
            File {progress.currentFileIndex}/{progress.totalFiles}: <strong>{progress.fileName}</strong>
          </p>
          <p>
            Extracting page {progress.currentPage}/{progress.totalPages}
          </p>
        </div>
      ) : null}
    </section>
  );
}
