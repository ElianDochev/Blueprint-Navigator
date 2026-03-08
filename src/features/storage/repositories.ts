import { db } from "./db";
import type { DrawingPage, Project, StoredDrawingFile } from "../drawings/drawings.types";

const RECENT_QUERIES_KEY = "recentQueries";

export async function saveDrawingWithPages(
  drawing: StoredDrawingFile,
  pages: DrawingPage[]
): Promise<void> {
  await db.transaction("rw", db.drawings, db.pages, async () => {
    await db.drawings.put(drawing);
    await db.pages.bulkPut(pages);
  });
}

export async function listDrawings(): Promise<StoredDrawingFile[]> {
  return db.drawings.orderBy("importedAt").reverse().toArray();
}

export async function listDrawingsByProject(projectId: string): Promise<StoredDrawingFile[]> {
  const drawings = await db.drawings.where("projectId").equals(projectId).toArray();
  return drawings.sort((a, b) => b.importedAt.localeCompare(a.importedAt));
}

export async function listPages(): Promise<DrawingPage[]> {
  return db.pages.toArray();
}

export async function listPagesByFileId(fileId: string): Promise<DrawingPage[]> {
  return db.pages.where("fileId").equals(fileId).sortBy("pageNumber");
}

export async function getDrawingById(id: string): Promise<StoredDrawingFile | undefined> {
  return db.drawings.get(id);
}

export async function createProject(name: string): Promise<Project> {
  const project: Project = {
    id: `project_${crypto.randomUUID()}`,
    name: name.trim(),
    createdAt: new Date().toISOString()
  };

  await db.projects.put(project);
  return project;
}

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy("createdAt").reverse().toArray();
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function saveRecentQuery(query: string): Promise<void> {
  if (!query.trim()) {
    return;
  }

  const existing = await db.preferences.get(RECENT_QUERIES_KEY);
  const parsed = existing?.value ? JSON.parse(existing.value) : [];
  const deduplicated = buildRecentQueries(parsed, query);
  await db.preferences.put({
    key: RECENT_QUERIES_KEY,
    value: JSON.stringify(deduplicated)
  });
}

export async function listRecentQueries(): Promise<string[]> {
  const existing = await db.preferences.get(RECENT_QUERIES_KEY);
  if (!existing) {
    return [];
  }

  try {
    return JSON.parse(existing.value) as string[];
  } catch {
    return [];
  }
}

export function buildRecentQueries(existing: string[], incoming: string): string[] {
  const normalizedIncoming = incoming.trim();
  if (!normalizedIncoming) {
    return existing.slice(0, 8);
  }

  return [normalizedIncoming, ...existing.filter((item) => item !== normalizedIncoming)].slice(0, 8);
}
