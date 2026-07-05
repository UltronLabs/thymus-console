-- CreateTable
CREATE TABLE "TenantPolicy" (
    "tenantId" TEXT NOT NULL PRIMARY KEY,
    "quarantineBelow" REAL NOT NULL DEFAULT 0.45,
    "tagBelow" REAL NOT NULL DEFAULT 0.70,
    "enabledDetectors" TEXT NOT NULL DEFAULT '["origin","injection","egress","conflict","rules"]',
    "updatedAt" DATETIME NOT NULL
);
