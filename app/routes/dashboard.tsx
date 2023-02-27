import { json, type LoaderArgs } from "@remix-run/cloudflare";
import {
	Form,
	Outlet,
	useLocation,
	type ShouldReloadFunction,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { buttonStyles } from "~/components/buttons";

import {
	Dashboard,
	DashboardMenu,
	DashboardMenuHeader,
	ListItem,
	ListItems,
} from "~/components/dashboard";

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

export default function DashboardLayout() {
	const location = useLocation();

	const redirectTo = encodeURIComponent(location.pathname + location.search);

	return (
		<>
			<Dashboard>
				<DashboardMenu id="dashboard-menu" menu="dashboard-menu">
					<DashboardMenuHeader label="Menu" menu="dashboard-menu" />

					<ListItems>
						<ListItem to="plants">Manage Plants</ListItem>
						<ListItem to="planner">Planner</ListItem>
					</ListItems>

					<hr />

					<footer className="p-2 text-center">
						<Form action={`/logout?redirectTo=${redirectTo}`} method="post">
							<button
								className={buttonStyles({
									full: true,
									uniform: true,
								})}
							>
								Logout
							</button>
						</Form>
					</footer>
				</DashboardMenu>

				<Outlet />
			</Dashboard>
		</>
	);
}
