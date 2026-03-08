import type { DrawingFile } from "../features/drawings/drawings.types";
import { planTypeLabel } from "../features/drawings/plan-type";

interface RecentFilesPanelProps {
  files: DrawingFile[];
  onOpen: (fileId: string) => void;
}

export function RecentFilesPanel({ files, onOpen }: RecentFilesPanelProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Recent Files</h2>
      {files.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No recent files yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li key={file.id}>
              <button
                type="button"
                onClick={() => onOpen(file.id)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:border-accent/70"
              >
                <p className="text-sm font-medium text-ink">{file.fileName}</p>
                <p className="text-xs text-slate-600">
                  {file.projectName} • {file.pageCount} pages • {planTypeLabel(file.planType)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
