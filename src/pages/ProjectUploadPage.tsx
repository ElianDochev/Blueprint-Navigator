import { ImportPanel } from "../components/ImportPanel";
import { PdfViewer } from "../components/PdfViewer";
import type {
  ImportCandidate,
  ImportProgress,
  Project,
  SearchResult,
  StoredDrawingFile
} from "../features/drawings/drawings.types";

interface ProjectUploadPageProps {
  project: Project | null;
  drawings: StoredDrawingFile[];
  importing: boolean;
  progress: ImportProgress | null;
  selectedResult: SearchResult | null;
  selectedDrawing: StoredDrawingFile | null;
  onBack: () => void;
  onImport: (files: ImportCandidate[], projectName: string) => Promise<void>;
  onOpenDrawing: (file: StoredDrawingFile) => void;
}

export function ProjectUploadPage({
  project,
  drawings,
  importing,
  progress,
  selectedResult,
  selectedDrawing,
  onBack,
  onImport,
  onOpenDrawing
}: ProjectUploadPageProps) {
  if (!project) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 md:p-8">
        <section className="rounded-3xl border border-white/30 bg-white/85 p-5 shadow-lg backdrop-blur">
          <h1 className="text-xl font-semibold text-brand-950">Project Not Found</h1>
          <p className="mt-2 text-sm text-brand-900/70">
            This project does not exist anymore. Go back to dashboard and choose another project.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Back To Dashboard
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <header className="rounded-3xl border border-white/20 bg-white/85 p-5 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-brand-600/30 bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-800"
        >
          Back To Dashboard
        </button>
        <h1 className="mt-3 text-2xl font-semibold text-brand-950">{project.name}</h1>
        <p className="text-sm text-brand-900/70">Add images/plans and open files in this project.</p>
      </header>

      <ImportPanel importing={importing} progress={progress} projectName={project.name} onImport={onImport} />

      <section className="rounded-3xl border border-white/30 bg-white/80 p-4 shadow-lg backdrop-blur">
        <h2 className="text-lg font-semibold text-brand-950">Project Files</h2>
        {drawings.length === 0 ? (
          <p className="mt-2 text-sm text-brand-900/70">No files yet. Upload PNG or PDF plans to this project.</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {drawings.map((file) => (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => onOpenDrawing(file)}
                  className="w-full rounded-xl border border-brand-600/20 bg-white px-3 py-2 text-left hover:border-brand-600/60"
                >
                  <p className="text-sm font-semibold text-brand-950">{file.fileName}</p>
                  <p className="text-xs text-brand-900/70">{file.pageCount} page(s)</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PdfViewer drawing={selectedDrawing} pageNumber={selectedResult?.pageNumber ?? 1} />
    </main>
  );
}
