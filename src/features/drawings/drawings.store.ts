import type { DrawingPage, StoredDrawingFile } from "./drawings.types";
import { listDrawings, listPages } from "../storage/repositories";

export interface DrawingsSnapshot {
  drawings: StoredDrawingFile[];
  pages: DrawingPage[];
}

export async function loadDrawingsSnapshot(): Promise<DrawingsSnapshot> {
  const [drawings, pages] = await Promise.all([listDrawings(), listPages()]);
  return { drawings, pages };
}
