import {
	redirect,
	createCookieSessionStorage,
	type SessionStorage,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";

import { UserService, type AuthService, type User } from "~/services";

export class RemixAuthService implements AuthService {
	public authenticator: Authenticator<User>;
	private sessionStorage: SessionStorage;

	constructor(
		secrets: string[],
		private db: D1Database,
		googleClientId?: string,
		googleClientSecret?: string,
		users: UserService
	) {
		if (!googleClientId) throw new Error("Google Client ID Required for Auth");
		if (!googleClientSecret)
			throw new Error("Google Client Secret Required for Auth");

		this.sessionStorage = createCookieSessionStorage({
			cookie: {
				name: "auth",
				httpOnly: true,
				path: "/",
				sameSite: "lax",
				secrets,
			},
		});

		this.authenticator = new Authenticator<User>(this.sessionStorage);
		this.authenticator.use(
			new GoogleStrategy(
				{
					clientID: googleClientId,
					clientSecret: googleClientSecret,
					callbackURL:
						"https://wwww.bloomers.farm/auth" || "http://localhost:8787/auth",
				},
				async ({ accessToken, refreshToken, extraParams, profile }) => {
					let user = await users.getUser(profile.emails[0].value);

					if (!user) {
						const newUserId = crypto.randomUUID();
						user = await users.createUser({
							user_id: newUserId,
							email: profile.emails[0].value,
							first_name: profile.name.givenName || "",
							last_name: profile.name.familyName || "",
							farm_id: "eaa8f808",
							photo: profile.photos[0].value || "",
						});
					}

					return user;
				}
			),
			"google"
		);
	}

	async getUser(request: Request) {
		const cookie = request.headers.get("Cookie");
		const session = await this.sessionStorage.getSession(cookie);
		const user = await this.authenticator.isAuthenticated(session);
		return user || undefined;
	}

	async requireUser(request: Request) {
		const user = await this.getUser(request);

		if (!user) {
			const url = new URL(request.url);
			const redirectTo = url.pathname + url.search;

			const searchParams = new URLSearchParams({
				redirectTo,
			});

			throw redirect(`/login?${searchParams.toString()}`);
		}

		return user;
	}

	async destroySession(request: Request) {
		const cookie = request.headers.get("Cookie");
		const session = await this.sessionStorage.getSession(cookie);

		return await this.sessionStorage.destroySession(session, {
			secure: request.url.startsWith("https://"),
		});
	}
}
