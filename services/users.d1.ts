import { User, UserService, type Item, type ItemsService } from "~/services";

declare global {
	var __MOCK_ITEMS__: Item[];
}

export class D1UsersService implements UserService {
	constructor(private db: D1Database) {}

	async getUser(email: string) {
		let result = await this.db
			.prepare(
				"SELECT `user_id`, `email`, `first_name`, `last_name`, `farm_id` FROM `User` WHERE `email`=?;"
			)
			.bind(email)
			.first<User>();

		return result;
	}
	async createUser(user: User) {
		let result = await this.db
			.prepare(
				"INSERT INTO `User` (`user_id`, `email`, `first_name`, `last_name`, `farm_id`, `photo`) VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING `user_id`, `email`, `first_name`, `last_name`, `farm_id`, `photo`;"
			)
			.bind(
				user.user_id,
				user.email,
				user.first_name,
				user.last_name,
				"eaa8f808",
				user.photo
			)
			.first<User>();

		if (!result) throw new Error("Failed to create user: " + user.email);

		return result;
	}
}
