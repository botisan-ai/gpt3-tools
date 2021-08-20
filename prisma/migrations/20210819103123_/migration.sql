-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FinetuneDataSet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "promptTemplate" TEXT,
    "completionTemplate" TEXT,
    "totalTokenCount" INTEGER
);
INSERT INTO "new_FinetuneDataSet" ("completionTemplate", "createdAt", "id", "promptTemplate", "title", "totalTokenCount", "updatedAt") SELECT "completionTemplate", "createdAt", "id", "promptTemplate", "title", "totalTokenCount", "updatedAt" FROM "FinetuneDataSet";
DROP TABLE "FinetuneDataSet";
ALTER TABLE "new_FinetuneDataSet" RENAME TO "FinetuneDataSet";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
