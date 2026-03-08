import { ResultsList } from "../components/ResultsList";
import { SearchBar } from "../components/SearchBar";
import { VoiceButton } from "../components/VoiceButton";
import type { Project, SearchResult } from "../features/drawings/drawings.types";
import { supportedVoiceExamples } from "../features/voice/voice.commands";

interface DashboardPageProps {
  projects: Project[];
  drawingCountByProject: Map<string, number>;
  results: SearchResult[];
  lastTranscript: string;
  voiceSupported: boolean;
  voiceListening: boolean;
  onSearch: (query: string) => Promise<void>;
  onVoiceToggle: () => Promise<void>;
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
  onSelectResult: (result: SearchResult) => void;
}

export function DashboardPage({
  projects,
  drawingCountByProject,
  results,
  lastTranscript,
  voiceSupported,
  voiceListening,
  onSearch,
  onVoiceToggle,
  onCreateProject,
  onOpenProject,
  onSelectResult
}: DashboardPageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 p-4 md:p-8">
      <header className="rounded-3xl border border-white/20 bg-white/85 p-6 shadow-lg backdrop-blur">
        <img src="/branding/logo-lockup.png" alt="Blueprint Navigator" className="h-12 w-auto" />
        <p className="mt-2 max-w-2xl text-sm text-brand-900/75">
          Search every project from one dashboard. Say or type: "give me plans for balcony" or
          "give me plans for project tower-a balcony".
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <SearchBar
            disabled={projects.length === 0}
            onSearch={onSearch}
            placeholder='Try: "give me plans for balcony"'
            actionLabel="Run Search"
          />
          <VoiceButton
            supported={voiceSupported}
            listening={voiceListening}
            disabled={projects.length === 0}
            onToggle={onVoiceToggle}
          />

          <section className="rounded-3xl border border-white/30 bg-white/80 p-4 text-xs text-brand-900/80 shadow-lg backdrop-blur">
            <p className="font-semibold text-brand-950">Voice examples</p>
            <ul className="mt-2 list-disc pl-4">
              {supportedVoiceExamples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
            {lastTranscript ? <p className="mt-2">Last transcript: "{lastTranscript}"</p> : null}
          </section>

          <ResultsList results={results} onSelect={onSelectResult} />
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-white/30 bg-white/80 p-4 shadow-lg backdrop-blur">
            <h2 className="text-lg font-semibold text-brand-950">Projects</h2>
            {projects.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-brand-600/40 bg-brand-600/5 p-4 text-sm text-brand-900/80">
                <p>No projects yet.</p>
                <button
                  type="button"
                  onClick={onCreateProject}
                  className="mt-3 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  Create Project
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCreateProject}
                  className="mt-3 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  Create New Project
                </button>
                <ul className="mt-3 space-y-2">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <button
                        type="button"
                        onClick={() => onOpenProject(project.id)}
                        className="w-full rounded-xl border border-brand-600/20 bg-white px-3 py-2 text-left hover:border-brand-700/60"
                      >
                        <p className="text-sm font-semibold text-brand-950">{project.name}</p>
                        <p className="text-xs text-brand-900/70">
                          {drawingCountByProject.get(project.id) ?? 0} file(s)
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
