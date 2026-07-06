-- CreateTable
CREATE TABLE "CustomRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "trustDelta" REAL NOT NULL DEFAULT -0.4,
    "flags" TEXT NOT NULL DEFAULT '[]',
    "allOf" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TenantPolicy" (
    "tenantId" TEXT NOT NULL PRIMARY KEY,
    "quarantineBelow" REAL NOT NULL DEFAULT 0.45,
    "tagBelow" REAL NOT NULL DEFAULT 0.70,
    "enabledDetectors" TEXT NOT NULL DEFAULT '["origin","injection","egress","conflict","rules"]',
    "baseTrust" TEXT NOT NULL DEFAULT '{"trusted":0.95,"standard":0.8,"untrusted":0.5,"hostile":0.2}',
    "floorSeverity" TEXT NOT NULL DEFAULT 'high',
    "disabledRuleIds" TEXT NOT NULL DEFAULT '[]',
    "activeVersion" INTEGER,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TenantPolicy" ("enabledDetectors", "quarantineBelow", "tagBelow", "tenantId", "updatedAt") SELECT "enabledDetectors", "quarantineBelow", "tagBelow", "tenantId", "updatedAt" FROM "TenantPolicy";
DROP TABLE "TenantPolicy";
ALTER TABLE "new_TenantPolicy" RENAME TO "TenantPolicy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CustomRule_tenantId_idx" ON "CustomRule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomRule_tenantId_ruleId_key" ON "CustomRule"("tenantId", "ruleId");

-- CreateIndex
CREATE INDEX "PolicyVersion_tenantId_version_idx" ON "PolicyVersion"("tenantId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_tenantId_version_key" ON "PolicyVersion"("tenantId", "version");
