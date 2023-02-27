import { type Farm, type FarmService } from "~/services";

export class D1FarmsService implements FarmService {
	constructor(private db: D1Database) {}

	async getFarm(farm_id: string) {
		let result = await this.db
			.prepare("SELECT `farm_id`, `farm_name` FROM `Farm` WHERE `farm_id`=?;")
			.bind(farm_id)
			.first<Farm>();

		if (!result) throw new Error("Error querying farm: " + farm_id);

		return result;
	}
}
