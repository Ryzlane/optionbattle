-- CreateTable
CREATE TABLE "arenas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "arenas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "arena_collaborations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arenaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "invitedBy" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "arena_collaborations_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "arena_collaborations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "arena_collaborations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "arena_share_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arenaId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "expiresAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "maxUsage" INTEGER,
    CONSTRAINT "arena_share_links_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "arena_share_links_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "arena_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arenaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "arena_activities_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "arena_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_battles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "championId" TEXT,
    "userId" TEXT NOT NULL,
    "arenaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "battles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "battles_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_battles" ("championId", "createdAt", "description", "id", "status", "title", "updatedAt", "userId") SELECT "championId", "createdAt", "description", "id", "status", "title", "updatedAt", "userId" FROM "battles";
DROP TABLE "battles";
ALTER TABLE "new_battles" RENAME TO "battles";
CREATE INDEX "battles_userId_idx" ON "battles"("userId");
CREATE INDEX "battles_status_idx" ON "battles"("status");
CREATE INDEX "battles_arenaId_idx" ON "battles"("arenaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "arenas_userId_idx" ON "arenas"("userId");

-- CreateIndex
CREATE INDEX "arenas_status_idx" ON "arenas"("status");

-- CreateIndex
CREATE INDEX "arena_collaborations_arenaId_idx" ON "arena_collaborations"("arenaId");

-- CreateIndex
CREATE INDEX "arena_collaborations_userId_idx" ON "arena_collaborations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "arena_collaborations_arenaId_userId_key" ON "arena_collaborations"("arenaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "arena_share_links_token_key" ON "arena_share_links"("token");

-- CreateIndex
CREATE INDEX "arena_share_links_token_idx" ON "arena_share_links"("token");

-- CreateIndex
CREATE INDEX "arena_share_links_arenaId_idx" ON "arena_share_links"("arenaId");

-- CreateIndex
CREATE INDEX "arena_activities_arenaId_idx" ON "arena_activities"("arenaId");

-- CreateIndex
CREATE INDEX "arena_activities_userId_idx" ON "arena_activities"("userId");
