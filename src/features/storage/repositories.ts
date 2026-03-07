import { db } from "./db";
import type { DrawingPage, StoredDrawingFile } from "../drawings/drawings.types";

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

export async function listPages(): Promise<DrawingPage[]> {
  return db.pages.toArray();
}

export async function listPagesByFileId(fileId: string): Promise<DrawingPage[]> {
  return db.pages.where("fileId").equals(fileId).sortBy("pageNumber");
}

export async function getDrawingById(id: string): Promise<StoredDrawingFile | undefined> {
  return db.drawings.get(id);
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
