-- Migration number: 0000 	 2022-11-17T04:37:22.076Z

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    CONSTRAINT "User_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "Farm" ("farm_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Farm" (
    "farm_id" TEXT NOT NULL PRIMARY KEY,
    "farm_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Plant" (
    "plant_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    CONSTRAINT "Plant_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "Farm" ("farm_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Farm_farm_id_key" ON "Farm"("farm_id");
