import { json, type LoaderArgs } from "@remix-run/cloudflare";
import {
	Outlet,
	useLoaderData,
	type ShouldReloadFunction,
} from "@remix-run/react";

import {
	useAutoFocusSection,
	ListHeader,
	ListItem,
	ListItems,
	ListSection,
} from "~/components/dashboard";

export async function loader({
	context: {
		services: { auth, plants },
	},
	request,
}: LoaderArgs) {
	await auth.requireUser(request);
	const user = await auth.getUser(request);
	const allPlants = await plants.getAllPlants(user?.farm_id);

	return json({
		plants: allPlants,
		user,
	});
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) =>
	!!submission &&
	["/login", "/logout", "/items"].some((pathname) =>
		submission.action.startsWith(pathname)
	);

export default function Plants() {
	useAutoFocusSection(/^\/items\/?$/i, "dashboard-items");

	const { plants } = useLoaderData<typeof loader>();

	return (
		<>
			<ListSection id="dashboard-items">
				<ListHeader
					label="Plants"
					menu="dashboard-menu"
					actions={[
						{
							label: "New Plant",
							icon: "🆕",
							to: "new",
						},
					]}
				/>

				<ListItems>
					{plants.map(({ name, plant_id }) => (
						<ListItem key={plant_id} to={`item/${plant_id}`}>
							{name}
						</ListItem>
					))}
				</ListItems>
			</ListSection>

			<Outlet />
		</>
	);
}
