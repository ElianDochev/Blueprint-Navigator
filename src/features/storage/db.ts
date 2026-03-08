import Dexie, { type Table } from "dexie";
import type { DrawingPage, Project, StoredDrawingFile } from "../drawings/drawings.types";

export interface AppPreference {
  key: string;
  value: string;
}

class BlueprintDatabase extends Dexie {
  projects!: Table<Project, string>;
  drawings!: Table<StoredDrawingFile, string>;
  pages!: Table<DrawingPage, string>;
  preferences!: Table<AppPreference, string>;

  constructor() {
    super("blueprintNavigatorDb");

    this.version(1).stores({
      drawings: "id, fileHash, importedAt, fileName, projectName",
      pages: "id, fileId, pageNumber",
      preferences: "key"
    });

    this.version(2)
      .stores({
        drawings: "id, fileHash, importedAt, fileName, projectName, planType, sourceKind, mimeType",
        pages: "id, fileId, pageNumber",
        preferences: "key"
      })
      .upgrade((transaction) =>
        transaction
          .table("drawings")
          .toCollection()
          .modify((drawing: Record<string, unknown>) => {
            const legacyBlob = drawing.pdfBlob instanceof Blob ? drawing.pdfBlob : undefined;
            if (!(drawing.fileBlob instanceof Blob) && legacyBlob) {
              drawing.fileBlob = legacyBlob;
            }

            const mimeType = typeof drawing.mimeType === "string" ? drawing.mimeType : legacyBlob?.type || "application/pdf";
            drawing.mimeType = mimeType;

            if (!(drawing.fileBlob instanceof Blob)) {
              drawing.fileBlob = new Blob([], { type: mimeType });
            }

            drawing.sourceKind = mimeType === "application/pdf" ? "pdf" : "image";

            if (typeof drawing.planType !== "string") {
              drawing.planType = "unknown";
            }

            if (!Array.isArray(drawing.tags)) {
              drawing.tags = [];
            }

            delete drawing.pdfBlob;
          })
      );

    this.version(3)
      .stores({
        projects: "id, name, createdAt",
        drawings: "id, projectId, projectName, fileHash, importedAt, fileName, planType, sourceKind, mimeType",
        pages: "id, fileId, pageNumber",
        preferences: "key"
      })
      .upgrade(async (transaction) => {
        const drawingsTable = transaction.table("drawings");
        const projectsTable = transaction.table("projects");

        const drawings = (await drawingsTable.toArray()) as Array<Record<string, unknown>>;
        const projectIdByName = new Map<string, string>();
        const projectRows: Project[] = [];

        for (const drawing of drawings) {
          const rawProjectName =
            typeof drawing.projectName === "string" && drawing.projectName.trim() ? drawing.projectName.trim() : "Untitled Project";

          let projectId = projectIdByName.get(rawProjectName);
          if (!projectId) {
            projectId = `project_${crypto.randomUUID()}`;
            projectIdByName.set(rawProjectName, projectId);
            projectRows.push({
              id: projectId,
              name: rawProjectName,
              createdAt: typeof drawing.importedAt === "string" ? drawing.importedAt : new Date().toISOString()
            });
          }

          drawing.projectId = projectId;
          drawing.projectName = rawProjectName;
        }

        if (projectRows.length > 0) {
          await projectsTable.bulkPut(projectRows);
        }

        await drawingsTable.bulkPut(drawings as StoredDrawingFile[]);
      });
  }
}

export const db = new BlueprintDatabase();
