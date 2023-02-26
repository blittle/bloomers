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

export interface User {
	user_id: string;
	email: string;
	first_name: string;
	last_name: string;
	farm_id: string;
	photo: string;
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
