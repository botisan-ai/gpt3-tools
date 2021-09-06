-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FinetuneData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dataSetId" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "completion" TEXT NOT NULL,
    "promptTokenCount" INTEGER,
    "completionTokenCount" INTEGER,
    FOREIGN KEY ("dataSetId") REFERENCES "FinetuneDataSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FinetuneData" ("completion", "completionTokenCount", "createdAt", "dataSetId", "id", "prompt", "promptTokenCount", "updatedAt") SELECT "completion", "completionTokenCount", "createdAt", "dataSetId", "id", "prompt", "promptTokenCount", "updatedAt" FROM "FinetuneData";
DROP TABLE "FinetuneData";
ALTER TABLE "new_FinetuneData" RENAME TO "FinetuneData";
CREATE TABLE "new_FinetuneDataSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "promptTemplate" TEXT,
    "completionTemplate" TEXT,
    "totalTokenCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_FinetuneDataSet" ("completionTemplate", "createdAt", "id", "promptTemplate", "title", "totalTokenCount", "updatedAt") SELECT "completionTemplate", "createdAt", "id", "promptTemplate", "title", coalesce("totalTokenCount", 0) AS "totalTokenCount", "updatedAt" FROM "FinetuneDataSet";
DROP TABLE "FinetuneDataSet";
ALTER TABLE "new_FinetuneDataSet" RENAME TO "FinetuneDataSet";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
