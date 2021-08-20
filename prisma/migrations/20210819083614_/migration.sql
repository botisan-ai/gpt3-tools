/*
  Warnings:

  - Added the required column `completionTokenCount` to the `FinetuneData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promptTokenCount` to the `FinetuneData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTokenCount` to the `FinetuneDataSet` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FinetuneData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dataSetId" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "completion" TEXT NOT NULL,
    "promptTokenCount" INTEGER NOT NULL,
    "completionTokenCount" INTEGER NOT NULL,
    FOREIGN KEY ("dataSetId") REFERENCES "FinetuneDataSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FinetuneData" ("completion", "createdAt", "dataSetId", "id", "prompt", "updatedAt") SELECT "completion", "createdAt", "dataSetId", "id", "prompt", "updatedAt" FROM "FinetuneData";
DROP TABLE "FinetuneData";
ALTER TABLE "new_FinetuneData" RENAME TO "FinetuneData";
CREATE TABLE "new_FinetuneDataSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "promptTemplate" TEXT,
    "completionTemplate" TEXT,
    "totalTokenCount" INTEGER NOT NULL
);
INSERT INTO "new_FinetuneDataSet" ("completionTemplate", "createdAt", "id", "promptTemplate", "title", "updatedAt") SELECT "completionTemplate", "createdAt", "id", "promptTemplate", "title", "updatedAt" FROM "FinetuneDataSet";
DROP TABLE "FinetuneDataSet";
ALTER TABLE "new_FinetuneDataSet" RENAME TO "FinetuneDataSet";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
