import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusBanner } from "../components/StatusBanner";
import { importDrawingFiles } from "../features/drawings/drawings.service";
import { loadDrawingsSnapshot } from "../features/drawings/drawings.store";
import type {
  ImportCandidate,
  ImportProgress,
  Project,
  SearchResult,
  StoredDrawingFile
} from "../features/drawings/drawings.types";
import { parsePlanQueryWithLlm } from "../features/llm/llm.query";
import { SearchService } from "../features/search/search.service";
import { createProject, saveRecentQuery } from "../features/storage/repositories";
import { useVoiceAdapter } from "../features/voice/voice.adapter";
import { normalizeText } from "../utils/text";
import { createProjectPath, dashboardPath, parseAppRoute, projectUploadPath } from "./routes";
import { CreateProjectPage } from "../pages/CreateProjectPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProjectUploadPage } from "../pages/ProjectUploadPage";

function getProjectMatchesByName(projects: Project[], rawName: string): Project[] {
  const normalizedTarget = normalizeText(rawName);
  return projects.filter((project) => {
    const normalizedProjectName = normalizeText(project.name);
    return (
      normalizedProjectName === normalizedTarget ||
      normalizedProjectName.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedProjectName)
    );
  });
}

export function App() {
  const searchService = useMemo(() => new SearchService(), []);

  const [route, setRoute] = useState(() => parseAppRoute(window.location.pathname));
  const [projects, setProjects] = useState<Project[]>([]);
  const [drawings, setDrawings] = useState<StoredDrawingFile[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [status, setStatus] = useState<{ tone: "info" | "success" | "error"; message: string } | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");

  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

  const drawingCountByProject = useMemo(() => {
    const counts = new Map<string, number>();
    drawings.forEach((drawing) => {
      counts.set(drawing.projectId, (counts.get(drawing.projectId) ?? 0) + 1);
    });
    return counts;
  }, [drawings]);

  const activeProject = useMemo(() => {
    if (route.name !== "project_upload") {
      return null;
    }

    return projects.find((project) => project.id === route.projectId) ?? null;
  }, [projects, route]);

  const activeProjectDrawings = useMemo(() => {
    if (route.name !== "project_upload") {
      return [];
    }

    return drawings.filter((drawing) => drawing.projectId === route.projectId);
  }, [drawings, route]);

  const selectedDrawing = useMemo(
    () => (selectedResult ? drawings.find((drawing) => drawing.id === selectedResult.fileId) ?? null : null),
    [drawings, selectedResult]
  );

  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }

    setRoute(parseAppRoute(path));
  }, []);

  useEffect(() => {
    void refreshSnapshot();
  }, []);

  useEffect(() => {
    function onPopState() {
      setRoute(parseAppRoute(window.location.pathname));
    }

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  async function refreshSnapshot() {
    const snapshot = await loadDrawingsSnapshot();
    setProjects(snapshot.projects);
    setDrawings(snapshot.drawings);
    searchService.hydrate(snapshot.drawings, snapshot.pages);
  }

  const runSmartSearch = useCallback(
    async (query: string, fromVoice = false) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }

      const parsed = await parsePlanQueryWithLlm(trimmed);
      const topic = parsed.topic || trimmed;
      let nextResults = searchService.searchText(topic);

      if (parsed.projectName) {
        const projectMatches = getProjectMatchesByName(projects, parsed.projectName);
        if (projectMatches.length === 0) {
          setResults([]);
          setSelectedResult(null);
          setStatus({
            tone: "error",
            message: `No project found matching "${parsed.projectName}".`
          });
          return;
        }

        if (projectMatches.length > 1) {
          setResults([]);
          setSelectedResult(null);
          const choices = projectMatches.map((project) => `${project.name} (${project.id.slice(-4)})`).join(", ");
          setStatus({
            tone: "info",
            message: `I found multiple matching projects: ${choices}. Please clarify the project name.`
          });
          return;
        }

        const project = projectMatches[0];
        nextResults = nextResults.filter((result) => result.projectId === project.id);
      } else {
        const matchedProjectIds = [...new Set(nextResults.map((result) => result.projectId))];
        if (matchedProjectIds.length > 1) {
          const projectNames = matchedProjectIds
            .map((id) => `${projectById.get(id)?.name ?? "Unknown"} (${id.slice(-4)})`)
            .join(", ");
          setResults(nextResults);
          setSelectedResult(null);
          setStatus({
            tone: "info",
            message: `I found matches in multiple projects (${projectNames}). Ask again with "project <name>" to narrow the result.`
          });
          return;
        }
      }

      setResults(nextResults);

      if (!nextResults[0]) {
        setSelectedResult(null);
        setStatus({
          tone: "info",
          message: `No plans matched "${trimmed}".`
        });
        return;
      }

      setSelectedResult(nextResults[0]);
      const shouldOpenPlanNow = Boolean(parsed.projectName) || fromVoice;
      if (shouldOpenPlanNow) {
        navigateTo(projectUploadPath(nextResults[0].projectId));
      }

      if (trimmed.length >= 2) {
        void saveRecentQuery(trimmed);
      }
    },
    [navigateTo, projectById, projects, searchService]
  );

  const voice = useVoiceAdapter(
    useCallback(
      (transcript: string) => {
        setLastTranscript(transcript);
        setStatus({
          tone: "info",
          message: `Voice transcript: "${transcript}".`
        });
        void runSmartSearch(transcript, true);
      },
      [runSmartSearch]
    ),
    useCallback((message: string) => {
      setStatus({ tone: "error", message });
    }, [])
  );

  async function handleCreateProject(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setStatus({ tone: "error", message: "Project name is required." });
      return;
    }

    try {
      const project = await createProject(trimmedName);
      await refreshSnapshot();
      setStatus({ tone: "success", message: `Project "${project.name}" created.` });
      navigateTo(projectUploadPath(project.id));
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to create project."
      });
    }
  }

  async function handleImport(files: ImportCandidate[], _projectName: string) {
    if (!activeProject) {
      setStatus({ tone: "error", message: "Select a project before uploading files." });
      return;
    }

    setImporting(true);
    setStatus({ tone: "info", message: `Uploading into "${activeProject.name}"...` });
    setProgress(null);

    try {
      const report = await importDrawingFiles(files, activeProject, setProgress);
      await refreshSnapshot();

      if (report.importedFiles > 0 && report.skippedFiles.length === 0) {
        setStatus({ tone: "success", message: `Imported ${report.importedFiles} file(s).` });
      } else if (report.importedFiles > 0) {
        setStatus({
          tone: "info",
          message: `Imported ${report.importedFiles} file(s). Skipped ${report.skippedFiles.length}.`
        });
      } else {
        setStatus({ tone: "error", message: "No valid files were imported." });
      }
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Unexpected import error."
      });
    } finally {
      setImporting(false);
      setProgress(null);
    }
  }

  function handleSelectResult(result: SearchResult) {
    setSelectedResult(result);
    navigateTo(projectUploadPath(result.projectId));
  }

  function handleOpenDrawing(file: StoredDrawingFile) {
    const fallbackResult: SearchResult = {
      projectId: file.projectId,
      projectName: file.projectName,
      fileId: file.id,
      fileName: file.fileName,
      pageNumber: 1,
      score: 1,
      snippet: "Opened from project workspace."
    };

    setSelectedResult(fallbackResult);
  }

  async function handleVoiceToggle() {
    try {
      if (voice.listening) {
        await voice.stop();
        return;
      }

      await voice.start();
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Voice input failed."
      });
    }
  }

  return (
    <>
      {status ? (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-8 md:pt-6">
          <StatusBanner tone={status.tone} message={status.message} />
        </div>
      ) : null}

      {route.name === "dashboard" ? (
        <DashboardPage
          projects={projects}
          drawingCountByProject={drawingCountByProject}
          results={results}
          lastTranscript={lastTranscript}
          voiceSupported={voice.supported}
          voiceListening={voice.listening}
          onSearch={runSmartSearch}
          onVoiceToggle={handleVoiceToggle}
          onCreateProject={() => navigateTo(createProjectPath())}
          onOpenProject={(projectId) => navigateTo(projectUploadPath(projectId))}
          onSelectResult={handleSelectResult}
        />
      ) : null}

      {route.name === "create_project" ? (
        <CreateProjectPage onCreate={handleCreateProject} onBack={() => navigateTo(dashboardPath())} />
      ) : null}

      {route.name === "project_upload" ? (
        <ProjectUploadPage
          project={activeProject}
          drawings={activeProjectDrawings}
          importing={importing}
          progress={progress}
          selectedResult={selectedResult}
          selectedDrawing={selectedDrawing}
          onBack={() => navigateTo(dashboardPath())}
          onImport={handleImport}
          onOpenDrawing={handleOpenDrawing}
        />
      ) : null}
    </>
  );
}
