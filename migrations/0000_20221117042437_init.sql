-- Migration number: 0000 	 2022-11-17T04:37:22.076Z
-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL
);

CREATE TABLE "Users" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "challenge" TEXT,
    "first_name" TEXT,
    "last_name" TEXT
);

CREATE TABLE "Authenticators" (
    "credential_id" TEXT NOT NULL PRIMARY KEY,
    "counter" INTEGER NOT NULL,
    "credential_public_key" TEXT NOT NULL,
    "user_id" TEXT NOT NULL
);