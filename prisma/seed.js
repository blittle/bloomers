const { PrismaClient } = require("@prisma/client");

async function seed() {
	const client = new PrismaClient();
	const farmsCount = await client.farm.count();
	if (!farmsCount) {
		await client.farm.create({
			data: {
				farm_id: "9aa8a16d",
				farm_name: "Fox Farm Flowers",
			},
		});
		await client.farm.create({
			data: {
				farm_id: "eaa8f808",
				farm_name: "Test Farm",
			},
		});
	}
}

seed().then(
	() => {
		process.exit(0);
	},
	(reason) => {
		console.error(reason);
		process.exit(1);
	}
);
