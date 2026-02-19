-- CreateTable
CREATE TABLE "arena_invitations" (
    "id" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arena_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "arena_invitations_token_key" ON "arena_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "arena_invitations_arenaId_email_key" ON "arena_invitations"("arenaId", "email");

-- CreateIndex
CREATE INDEX "arena_invitations_token_idx" ON "arena_invitations"("token");

-- CreateIndex
CREATE INDEX "arena_invitations_email_idx" ON "arena_invitations"("email");

-- CreateIndex
CREATE INDEX "arena_invitations_status_idx" ON "arena_invitations"("status");

-- AddForeignKey
ALTER TABLE "arena_invitations" ADD CONSTRAINT "arena_invitations_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arenas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "arena_invitations" ADD CONSTRAINT "arena_invitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
