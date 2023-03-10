import invariant from "tiny-invariant";
import { type Plant, type PlantService } from "~/services";

export class D1PlantsService implements PlantService {
	constructor(private db: D1Database) {}

	async getAllPlants(farmId?: string) {
		invariant(farmId, "Farm ID Required!");

		let result = await this.db
			.prepare(
				"SELECT `plant_id`, `name`, `farm_id`, `sow_preference`, `spacing`, `germ_brightness`, `germ_temp`, `pinch`, `support`, `maturity_days`, `days_between_successions`, `production_level`, `days_sowing_transplant`, `default_first_transplant_date` FROM `Plant` WHERE `farm_id`=?;"
			)
			.bind(farmId)
			.all<Plant>();

		if (!result || !result.results) throw new Error("Error querying plants");

		return result.results;
	}
	async getPlantById(plantId?: string) {
		invariant(plantId, "Plant ID Required!");

		let result = await this.db
			.prepare(
				"SELECT `plant_id`, `name`, `farm_id`, `sow_preference`, `spacing`, `germ_brightness`, `germ_temp`, `pinch`, `support`, `maturity_days`, `days_between_successions`, `production_level`, `days_sowing_transplant`, `default_first_transplant_date` FROM `Plant` WHERE `plant_id`=?;"
			)
			.bind(plantId)
			.first<Plant>();

		if (!result) throw new Error("Error querying plant");

		return result;
	}
	async updatePlant(plant: Plant) {
		invariant(plant, "Plant Required!");

		let result = await this.db
			.prepare(
				"UPDATE `Plant` SET `name`=?1, `sow_preference`=?2, `spacing`=?3, `germ_brightness`=?4, `germ_temp`=?5, `pinch`=?6, `support`=?7, `maturity_days`=?8, `days_between_successions`=?9, `production_level`=?10, `days_sowing_transplant`=?11, `default_first_transplant_date`=?12 WHERE `plant_id`=?13 LIMIT 1;"
			)
			.bind(
				plant.name,
				plant.sow_preference,
				plant.spacing,
				plant.germ_brightness,
				plant.germ_temp,
				plant.pinch,
				plant.support,
				plant.maturity_days,
				plant.days_between_successions,
				plant.production_level,
				plant.days_sowing_transplant,
				plant.default_first_transplant_date,
				plant.plant_id
			)
			.run();

		// `changes` is not yet implemented in the D1 alpha
		// if (!result.changes) {
		// 	throw new Error("Failed to update plant.");
		// }
	}
	async addPlant(plant: Omit<Plant, "plant_id">) {
		let result = await this.db
			.prepare(
				"INSERT INTO `Plant` (`name`, `farm_id`, `sow_preference`, `spacing`, `germ_brightness`, `germ_temp`, `pinch`, `support`, `maturity_days`, `days_between_successions`, `production_level`, `days_sowing_transplant`, `default_first_transplant_date`) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13) RETURNING `plant_id`, `name`, `farm_id`, `sow_preference`, `spacing`, `germ_brightness`, `germ_temp`, `pinch`, `support`, `maturity_days`, `days_between_successions`, `production_level`, `days_sowing_transplant`, `default_first_transplant_date`;"
			)
			.bind(
				plant.name,
				plant.farm_id,
				plant.sow_preference,
				plant.spacing,
				plant.germ_brightness,
				plant.germ_temp,
				plant.pinch,
				plant.support,
				plant.maturity_days,
				plant.days_between_successions,
				plant.production_level,
				plant.days_sowing_transplant,
				plant.default_first_transplant_date
			)
			.first<Plant>();

		if (!result) throw new Error("Failed to create plant: " + plant.name);

		return result;
	}
	async deletePlant(plantId: string, farmId: string): Promise<void> {
		const result = await this.db
			.prepare("DELETE FROM `Plant` WHERE `plant_id` = ? AND `farm_id`= ?;")
			.bind(plantId, farmId)
			.run();

		// `changes` is not yet implemented in the D1 alpha
		// if (!result.changes) {
		// 	throw new Error("Failed to delete plant.");
		// }
	}
}
