-- CreateTable
CREATE TABLE "subscriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,
    "data_cobranca" DATETIME NOT NULL,
    "categoria" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelado_em" DATETIME
);
