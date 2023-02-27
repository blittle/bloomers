import { createRequestHandler } from "@remix-run/cloudflare";
import { type AppLoadContext } from "@remix-run/server-runtime";
import {
	getAssetFromKV,
	NotFoundError,
	MethodNotAllowedError,
	type CacheControl,
} from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

import { RemixAuthService } from "./services/auth";
import { D1ItemsService } from "./services/items.d1";
import { MockItemsService } from "./services/items.mock";

import * as build from "./build/index.js";
import { D1UsersService } from "services/users.d1";
import { D1FarmsService } from "services/farms.d1";
import { D1PlantsService } from "services/plants.d1";

const assetManifest = JSON.parse(manifestJSON);
const remixHandler = createRequestHandler(build, process.env.NODE_ENV);

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		try {
			return await getAssetFromKV(
				{
					request,
					waitUntil(promise) {
						return ctx.waitUntil(promise);
					},
				},
				{
					cacheControl,
					ASSET_NAMESPACE: env.__STATIC_CONTENT,
					ASSET_MANIFEST: assetManifest,
				}
			);
		} catch (e) {
			if (e instanceof NotFoundError || e instanceof MethodNotAllowedError) {
				// fall through to the remix handler
			} else {
				return new Response("An unexpected error occurred", { status: 500 });
			}
		}

		if (!env.SESSION_SECRET) {
			console.error("Please define the SESSION_SECRET environment variable");
			return new Response("Internal Server Error", { status: 500 });
		}

		const users = new D1UsersService(env.APP_DB);

		if (!env.GOOGLE_CLIENT_ID) throw new Error("Google client id required");
		if (!env.GOOGLE_CLIENT_SECRET)
			throw new Error("Google client secret required");

		const loadContext: AppLoadContext = {
			services: {
				auth: new RemixAuthService(
					new URL(request.url).origin,
					[env.SESSION_SECRET!],
					env.APP_DB,
					env.GOOGLE_CLIENT_ID,
					env.GOOGLE_CLIENT_SECRET,
					users
				),
				// items: new MockItemsService(),
				items: new D1ItemsService(env.APP_DB),
				farms: new D1FarmsService(env.APP_DB),
				plants: new D1PlantsService(env.APP_DB),
				users,
			},
		};

		try {
			return await remixHandler(request, loadContext);
		} catch (reason) {
			console.error(reason);
			return new Response("Internal Server Error", { status: 500 });
		}
	},
};

function cacheControl(request: Request): Partial<CacheControl> {
	const url = new URL(request.url);
	if (url.pathname === "/sw.js") {
		return {
			browserTTL: 0,
			edgeTTL: 0,
		};
	}

	if (url.pathname.startsWith("/build")) {
		// Cache build files for 1 year since they have a hash in their URL
		return {
			browserTTL: 60 * 60 * 24 * 365,
			edgeTTL: 60 * 60 * 24 * 365,
		};
	}

	// Cache everything else for 10 minutes
	return {
		browserTTL: 60 * 10,
		edgeTTL: 60 * 10,
	};
}
