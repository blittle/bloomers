import { json, type LoaderArgs } from "@remix-run/cloudflare";
import {
	Form,
	Outlet,
	useLocation,
	type ShouldReloadFunction,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { buttonStyles } from "~/components/buttons";
import Layout from "~/components/Layout";

export async function loader({
	context: {
		services: { auth, farms },
	},
	request,
}: LoaderArgs) {
	await auth.requireUser(request);
	const user = await auth.getUser(request);
	invariant(user?.farm_id, "User must be associated with a Farm!");

	const farm = await farms.getFarm(user.farm_id);

	return json({
		user,
		farm,
	});
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) =>
	!!submission &&
	["/login", "/logout"].some((pathname) =>
		submission.action.startsWith(pathname)
	);

export default function App() {
	return (
		<Layout>
			<Outlet />
		</Layout>
	);
}
