-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscription_id" INTEGER NOT NULL,
    "ciclo_cobranca" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "tentativa_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviado_em" DATETIME,
    "erro" TEXT,
    CONSTRAINT "notification_deliveries_subscription_id_fkey"
      FOREIGN KEY ("subscription_id") REFERENCES "subscriptions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_deliveries_subscription_id_ciclo_cobranca_key"
  ON "notification_deliveries" ("subscription_id", "ciclo_cobranca");

-- CreateIndex
CREATE INDEX "notification_deliveries_subscription_id_idx"
  ON "notification_deliveries" ("subscription_id");
