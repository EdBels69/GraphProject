-- CreateTable
CREATE TABLE "ResearchJob" (
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
    "graphId" TEXT
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "doi" TEXT,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "year" INTEGER,
    "abstract" TEXT,
    "url" TEXT,
    "pdfUrl" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "screeningStatus" TEXT,
    "extractedData" TEXT,
    "entities" TEXT,
    "relations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ResearchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
