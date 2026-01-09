-- CreateTable
CREATE TABLE "Graph" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '2.0',
    "directed" BOOLEAN NOT NULL DEFAULT false,
    "nodes" TEXT NOT NULL,
    "edges" TEXT NOT NULL,
    "metrics" TEXT,
    "sources" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResearchJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topic" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "error" TEXT,
    "queries" TEXT NOT NULL,
    "articlesFound" INTEGER NOT NULL,
    "articlesProcessed" INTEGER NOT NULL,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "includedIds" TEXT,
    "excludedIds" TEXT,
    "exclusionReasons" TEXT,
    "reviewText" TEXT,
    "graphId" TEXT,
    CONSTRAINT "ResearchJob_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "Graph" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ResearchJob" ("articlesFound", "articlesProcessed", "createdAt", "endTime", "error", "excludedIds", "exclusionReasons", "graphId", "id", "includedIds", "mode", "progress", "queries", "reviewText", "startTime", "status", "topic", "updatedAt") SELECT "articlesFound", "articlesProcessed", "createdAt", "endTime", "error", "excludedIds", "exclusionReasons", "graphId", "id", "includedIds", "mode", "progress", "queries", "reviewText", "startTime", "status", "topic", "updatedAt" FROM "ResearchJob";
DROP TABLE "ResearchJob";
ALTER TABLE "new_ResearchJob" RENAME TO "ResearchJob";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
