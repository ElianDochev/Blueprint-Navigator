import type { DrawingPage, Project, StoredDrawingFile } from "./drawings.types";
import { listDrawings, listPages, listProjects } from "../storage/repositories";

export interface DrawingsSnapshot {
  projects: Project[];
  drawings: StoredDrawingFile[];
  pages: DrawingPage[];
}

export async function loadDrawingsSnapshot(): Promise<DrawingsSnapshot> {
  const [projects, drawings, pages] = await Promise.all([listProjects(), listDrawings(), listPages()]);
  return { projects, drawings, pages };
}
