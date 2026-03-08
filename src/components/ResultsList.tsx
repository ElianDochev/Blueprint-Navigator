import type { SearchResult } from "../features/drawings/drawings.types";

interface ResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export function ResultsList({ results, onSelect }: ResultsListProps) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-ink">Search Results</h2>

      {results.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">No matches yet. Search from the dashboard across your projects.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {results.map((result, index) => (
            <li key={`${result.fileId}-${result.pageNumber}-${index}`}>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-accent/70"
                onClick={() => onSelect(result)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-sm text-ink">{result.fileName}</strong>
                    <p className="text-[11px] text-slate-500">{result.projectName}</p>
                  </div>
                  <span className="text-xs text-slate-600">Page {result.pageNumber}</span>
                </div>
                <p className="mt-1 text-xs text-slate-600">Score: {result.score.toFixed(2)}</p>
                <p className="mt-2 text-sm text-slate-700">{result.snippet}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
