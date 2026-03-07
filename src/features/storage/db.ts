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
  }
}

export const db = new BlueprintDatabase();
