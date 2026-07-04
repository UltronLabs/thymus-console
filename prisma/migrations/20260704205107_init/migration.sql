-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL DEFAULT 'default',
    "agentId" TEXT,
    "sessionId" TEXT,
    "actorId" TEXT,
    "channel" TEXT NOT NULL,
    "originTrustTier" TEXT NOT NULL,
    "text" TEXT,
    "contentHash" TEXT,
    "verdict" TEXT NOT NULL,
    "trustScore" REAL NOT NULL,
    "severity" TEXT NOT NULL,
    "taintFlags" TEXT NOT NULL DEFAULT '[]',
    "reason" TEXT,
    "decidingPolicy" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'none',
    "reviewedAt" DATETIME,
    "reviewer" TEXT,
    "reviewNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Decision_tenantId_verdict_idx" ON "Decision"("tenantId", "verdict");

-- CreateIndex
CREATE INDEX "Decision_tenantId_createdAt_idx" ON "Decision"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Decision_tenantId_reviewStatus_idx" ON "Decision"("tenantId", "reviewStatus");
