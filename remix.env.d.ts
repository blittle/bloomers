/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare" />

import type { AuthService, ItemsService, UserService } from "./app/services";

declare module "@remix-run/server-runtime" {
	export interface AppLoadContext {
		services: {
			auth: AuthService;
			items: ItemsService;
			users: UserService;
		};
	}
}
