import { useEffect, useRef, useState } from "react";
import type { StoredDrawingFile } from "../features/drawings/drawings.types";
import { renderImagePage, renderPdfPage } from "../features/pdf/pdf.viewer";

interface PdfViewerProps {
  drawing: StoredDrawingFile | null;
  pageNumber: number;
}

export function PdfViewer({ drawing, pageNumber }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPage, setCurrentPage] = useState(pageNumber || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1.15);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!drawing) {
      setCurrentPage(1);
      setTotalPages(1);
      return;
    }

    if (drawing.sourceKind === "image") {
      setCurrentPage(1);
      setTotalPages(1);
      return;
    }

    setTotalPages(drawing.pageCount);
    setCurrentPage(Math.min(Math.max(pageNumber || 1, 1), drawing.pageCount));
  }, [drawing, pageNumber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!drawing || !canvas) {
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        setError(null);
        const result =
          drawing.sourceKind === "pdf"
            ? await renderPdfPage(drawing.fileBlob, currentPage, zoom, canvas)
            : await renderImagePage(drawing.fileBlob, zoom, canvas);
        if (!cancelled) {
          setTotalPages(result.totalPages);
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : "Failed to render drawing.");
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [drawing, currentPage, zoom]);

  if (!drawing) {
    return (
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Drawing Viewer</h2>
        <p className="mt-2 text-sm text-slate-600">Select a search result to open a page.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{drawing.fileName}</h2>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="rounded border border-slate-300 px-2 py-1"
            disabled={drawing.sourceKind !== "pdf"}
          >
            Prev
          </button>
          <span>
            Page {currentPage}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            className="rounded border border-slate-300 px-2 py-1"
            disabled={drawing.sourceKind !== "pdf"}
          >
            Next
          </button>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(2))))}
            className="rounded border border-slate-300 px-2 py-1"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => setZoom((value) => Math.min(2.2, Number((value + 0.1).toFixed(2))))}
            className="rounded border border-slate-300 px-2 py-1"
          >
            +
          </button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-3 overflow-auto rounded-xl border border-slate-200 p-3">
        <canvas ref={canvasRef} className="mx-auto" />
      </div>
    </section>
  );
}
