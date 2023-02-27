import { type Authenticator } from "remix-auth";

export interface Item {
	id: string;
	label: string;
}

export interface ItemsService {
	getAllItems(): Promise<Item[]>;
	getItemById(id: string): Promise<Item | undefined>;
	createItem({ label }: { label: string }): Promise<string>;
	deleteItemById(id: string): Promise<void>;
}

export interface PlantService {
	addPlant(plant: Omit<Plant, "plant_id">): Promise<Plant>;
	getAllPlants(farmId?: string): Promise<Plant[]>;
}

export interface FarmService {
	getFarm(farm_id: string): Promise<Farm>;
}

export interface PlantPlanService {
	addPlantPlan(plant: Omit<PlantPlan, "plant_plan_id">): Promise<PlantPlan>;
	getAllPlantPlans(): Promise<PlantPlan[]>;
}

export interface User {
	user_id: string;
	email: string;
	first_name: string;
	last_name: string;
	farm_id: string;
	photo: string;
}

export interface Plant {
	plant_id: number;
	name: string;
	farm_id: string;
	sow_preference: string;
	spacing: string;
	germ_brightness: "DARK" | "LIGHT";
	germ_temp: string;
	pinch: string;
	support: "NONE" | "NET" | "CORRAL";
	maturity_days: number;
	days_between_successions: number;
	production_level: "CC" | "OHW" | "MP";
	days_sowing_transplant: number;
	default_first_transplant_date: string;
}

export interface PlantPlan {
	plant_plan_id: number;
	farm_id: string;
	plant_id: number;
	plan_data: string;
}

export interface Farm {
	farm_id: string;
	farm_name: string;
}

export interface AuthService {
	authenticator: Authenticator<User>;
	getUser(request: Request): Promise<User | undefined>;
	requireUser(request: Request): Promise<User>;
	// setUser(request: Request, user: User): Promise<string>;
	destroySession(request: Request): Promise<string>;
}

export interface UserService {
	getUser(email: string): Promise<User | undefined>;
	createUser(user: User): Promise<User>;
}
