import { LoaderArgs } from "@remix-run/cloudflare";

export let loader = ({ request, context }: LoaderArgs) => {
	return context.services.auth.authenticator.authenticate("google", request, {
		successRedirect: "/app/dashboard",
		failureRedirect: "/login",
	});
};
