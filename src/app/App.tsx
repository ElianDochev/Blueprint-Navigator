import { useCallback, useEffect, useMemo, useState } from "react";
import { ImportPanel } from "../components/ImportPanel";
import { PdfViewer } from "../components/PdfViewer";
import { RecentFilesPanel } from "../components/RecentFilesPanel";
import { ResultsList } from "../components/ResultsList";
import { SearchBar } from "../components/SearchBar";
import { StatusBanner } from "../components/StatusBanner";
import { VoiceButton } from "../components/VoiceButton";
import { importDrawingFiles } from "../features/drawings/drawings.service";
import { loadDrawingsSnapshot } from "../features/drawings/drawings.store";
import type { ImportCandidate, ImportProgress, SearchResult, StoredDrawingFile } from "../features/drawings/drawings.types";
import { SearchService } from "../features/search/search.service";
import { saveRecentQuery } from "../features/storage/repositories";
import { useVoiceAdapter } from "../features/voice/voice.adapter";
import { supportedVoiceExamples } from "../features/voice/voice.commands";
import { parseVoiceCommand } from "../features/voice/voice.parser";

export function App() {
  const searchService = useMemo(() => new SearchService(), []);

  const [drawings, setDrawings] = useState<StoredDrawingFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [status, setStatus] = useState<{ tone: "info" | "success" | "error"; message: string } | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");

  useEffect(() => {
    void refreshSnapshot();
  }, []);

  const drawingCountLabel = useMemo(() => {
    if (drawings.length === 0) {
      return "No drawings imported yet.";
    }

    return `${drawings.length} drawing file${drawings.length > 1 ? "s" : ""} imported.`;
  }, [drawings.length]);

  const selectedDrawing = useMemo(
    () =>
      selectedResult ? drawings.find((drawing) => drawing.id === selectedResult.fileId) ?? null : null,
    [drawings, selectedResult]
  );

  const voice = useVoiceAdapter(
    useCallback(
      (transcript: string) => {
        setLastTranscript(transcript);
        const command = parseVoiceCommand(transcript);
        const nextResults = searchService.searchFromVoiceCommand(command);
        setResults(nextResults);

        if (nextResults[0]) {
          setSelectedResult(nextResults[0]);
        }

        setStatus({
          tone: "info",
          message:
            command.intent === "unknown"
              ? `Voice transcript captured: "${transcript}" (fallback to plain text search).`
              : `Voice command parsed as "${command.intent}" from "${transcript}".`
        });
      },
      [searchService]
    )
  );

  async function refreshSnapshot() {
    const snapshot = await loadDrawingsSnapshot();
    setDrawings(snapshot.drawings);
    searchService.hydrate(snapshot.drawings, snapshot.pages);
  }

  async function handleImport(files: ImportCandidate[], projectName: string) {
    setImporting(true);
    setStatus({ tone: "info", message: "Import started..." });
    setProgress(null);

    try {
      const report = await importDrawingFiles(files, projectName, setProgress);
      await refreshSnapshot();

      if (report.importedFiles > 0 && report.skippedFiles.length === 0) {
        setStatus({ tone: "success", message: `Imported ${report.importedFiles} file(s) successfully.` });
      } else if (report.importedFiles > 0) {
        setStatus({
          tone: "info",
          message: `Imported ${report.importedFiles} file(s). Skipped ${report.skippedFiles.length} invalid file(s).`
        });
      } else {
        setStatus({ tone: "error", message: "No valid PDF/PNG files were imported." });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected import error.";
      setStatus({ tone: "error", message });
    } finally {
      setImporting(false);
      setProgress(null);
    }
  }

  const handleSearch = useCallback(
    (query: string) => {
      const nextResults = searchService.searchText(query);
      setResults(nextResults);

      if (query.trim().length >= 2) {
        void saveRecentQuery(query.trim());
      }
    },
    [searchService]
  );

  function handleSelectResult(result: SearchResult) {
    setSelectedResult(result);
  }

  function handleOpenRecent(fileId: string) {
    const drawing = drawings.find((item) => item.id === fileId);
    if (!drawing) {
      return;
    }

    setSelectedResult({
      fileId,
      fileName: drawing.fileName,
      pageNumber: 1,
      score: 1,
      snippet: "Opened from recent files."
    });
  }

  async function handleVoiceToggle() {
    if (voice.listening) {
      await voice.stop();
      return;
    }

    await voice.start();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4 md:p-6">
      <header className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
        <img src="/branding/logo-lockup.png" alt="Blueprint Navigator" className="h-12 w-auto" />
        <p className="mt-2 text-sm text-slate-600">Local-only construction drawing finder MVP.</p>
      </header>

      {status ? <StatusBanner tone={status.tone} message={status.message} /> : null}

      <ImportPanel importing={importing} progress={progress} onImport={handleImport} />

      <section className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          <SearchBar disabled={drawings.length === 0} onSearch={handleSearch} />
          <VoiceButton
            supported={voice.supported}
            listening={voice.listening}
            disabled={drawings.length === 0}
            onToggle={handleVoiceToggle}
          />
          <section className="rounded-2xl bg-white p-4 text-xs text-slate-600 shadow-sm">
            <p>Supported voice commands:</p>
            <ul className="mt-2 list-disc pl-5">
              {supportedVoiceExamples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
            {lastTranscript ? <p className="mt-2">Last transcript: "{lastTranscript}"</p> : null}
          </section>
          <ResultsList results={results} onSelect={handleSelectResult} />
        </div>

        <div className="space-y-4">
          <RecentFilesPanel files={drawings} onOpen={handleOpenRecent} />
          <PdfViewer drawing={selectedDrawing} pageNumber={selectedResult?.pageNumber ?? 1} />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Repository State</h2>
        <p className="mt-1 text-sm text-slate-700">{drawingCountLabel}</p>
      </section>
    </main>
  );
}
