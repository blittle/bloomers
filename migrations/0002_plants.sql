-- Migration number: 0002 	 2023-02-26T23:25:03.409Z

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
DROP TABLE "Plant";
CREATE TABLE "Plant" (
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
