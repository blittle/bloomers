import { json, LoaderArgs } from "@remix-run/cloudflare";
import { Link, Outlet } from "@remix-run/react";

export async function loader({
	context: {
		services: { auth, plants },
	},
	request,
}: LoaderArgs) {
	const user = await auth.requireUser(request);

	return json({
		user,
	});
}

export default function Planner() {
	return (
		<>
			<div className="relative bg-white shadow-sm rounded-md mx-16 border">
				<div className="py-24 px-6 sm:px-6 sm:py-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							Farm Planner
						</h2>
						<p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
							Setup a planting schedule for your season. Easily compare new
							plants with existing plants already planned for the season. You
							can also add properties to differentiate what is planted when,
							like color and variation!
						</p>
						<div className="mt-10 flex items-center justify-center gap-x-6">
							<Link
								to="/app/planner/new"
								className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
							>
								Get started
							</Link>
						</div>
					</div>
				</div>
			</div>
			<Outlet />
		</>
	);
}
