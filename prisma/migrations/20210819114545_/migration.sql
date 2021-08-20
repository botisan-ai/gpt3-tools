/*
  Warnings:

  - You are about to drop the column `totalTokenCount` on the `FinetuneDataSet` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FinetuneDataSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "promptTemplate" TEXT,
    "completionTemplate" TEXT,
    "promptTemplateTokenCount" INTEGER,
    "completionTemplateTokenCount" INTEGER
);
INSERT INTO "new_FinetuneDataSet" ("completionTemplate", "createdAt", "id", "promptTemplate", "title", "updatedAt") SELECT "completionTemplate", "createdAt", "id", "promptTemplate", "title", "updatedAt" FROM "FinetuneDataSet";
DROP TABLE "FinetuneDataSet";
ALTER TABLE "new_FinetuneDataSet" RENAME TO "FinetuneDataSet";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
