import Dexie, { type Table } from "dexie";
import type { DrawingPage, StoredDrawingFile } from "../drawings/drawings.types";

export interface AppPreference {
  key: string;
  value: string;
}

class BlueprintDatabase extends Dexie {
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
  }
}

export const db = new BlueprintDatabase();
