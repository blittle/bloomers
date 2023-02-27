/*
  Warnings:

  - Added the required column `days_between_successions` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `days_sowing_transplant` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_first_transplant_date` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `germ_brightness` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `germ_temp` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maturity_days` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pinch` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `production_level` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sow_preference` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spacing` to the `Plant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `support` to the `Plant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PlantPlan" (
    "plant_plan_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "farm_id" TEXT NOT NULL,
    "plant_id" INTEGER NOT NULL,
    "plan_data" TEXT NOT NULL,
    CONSTRAINT "PlantPlan_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "Farm" ("farm_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlantPlan_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "Plant" ("plant_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plant" (
    "plant_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "sow_preference" TEXT NOT NULL,
    "spacing" TEXT NOT NULL,
    "germ_brightness" TEXT NOT NULL,
    "germ_temp" TEXT NOT NULL,
    "pinch" TEXT NOT NULL,
    "support" TEXT NOT NULL,
    "maturity_days" INTEGER NOT NULL,
    "days_between_successions" INTEGER NOT NULL,
    "production_level" TEXT NOT NULL,
    "days_sowing_transplant" INTEGER NOT NULL,
    "default_first_transplant_date" TEXT NOT NULL,
    CONSTRAINT "Plant_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "Farm" ("farm_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Plant" ("farm_id", "name", "plant_id") SELECT "farm_id", "name", "plant_id" FROM "Plant";
DROP TABLE "Plant";
ALTER TABLE "new_Plant" RENAME TO "Plant";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
