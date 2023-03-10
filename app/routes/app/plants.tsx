import { json, type LoaderArgs } from "@remix-run/cloudflare";
import {
	Link,
	Outlet,
	useLoaderData,
	type ShouldReloadFunction,
} from "@remix-run/react";
import { classNames, PRODUCTION_LEVEL } from "~/utils";

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
	const { plants } = useLoaderData<typeof loader>();

	return (
		<>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-gray-900">Plants</h1>
				<div className="flex">
					<p className="mt-2 text-sm text-gray-700 flex-1">
						A list of all the users in your account including their name, title,
						email and role.
					</p>
					<div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
						<Link
							to="/app/plants/new"
							className="block rounded-md bg-green-600 py-2 px-4 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
						>
							Add plant
						</Link>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="px-4 sm:px-6 lg:px-8">
					<div className="mt-8 flow-root">
						<div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle">
								<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
									<table className="min-w-full border-separate border-spacing-0">
										<thead>
											<tr>
												<th
													scope="col"
													className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
												>
													Name
												</th>
												<th
													scope="col"
													className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:table-cell"
												>
													First transplant date
												</th>
												<th
													scope="col"
													className="sticky top-0 z-10 hidden border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter lg:table-cell"
												>
													Production level
												</th>
												<th
													scope="col"
													className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
												>
													Planned count
												</th>
												<th
													scope="col"
													className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pr-4 pl-3 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
												>
													<span className="sr-only">Edit</span>
												</th>
											</tr>
										</thead>
										<tbody>
											{plants.map((plant, plantIndex) => (
												<tr key={plant.name}>
													<td
														className={classNames(
															plantIndex !== plants.length - 1
																? "border-b border-gray-200"
																: "",
															"whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8"
														)}
													>
														{plant.name}
													</td>
													<td
														className={classNames(
															plantIndex !== plants.length - 1
																? "border-b border-gray-200"
																: "",
															"whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 sm:table-cell"
														)}
													>
														{
															new Intl.DateTimeFormat("en-US", {
																weekday: "long",
																year: "numeric",
																month: "long",
																day: "numeric",
															})
																.format(
																	new Date(plant.default_first_transplant_date)
																)
																.split(",")[1]
														}
													</td>
													<td
														className={classNames(
															plantIndex !== plants.length - 1
																? "border-b border-gray-200"
																: "",
															"whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell"
														)}
													>
														{PRODUCTION_LEVEL[plant.production_level]}
													</td>
													<td
														className={classNames(
															plantIndex !== plants.length - 1
																? "border-b border-gray-200"
																: "",
															"whitespace-nowrap px-3 py-4 text-sm text-gray-500"
														)}
													>
														0
													</td>
													<td
														className={classNames(
															plantIndex !== plants.length - 1
																? "border-b border-gray-200"
																: "",
															"relative whitespace-nowrap py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-8 lg:pr-8"
														)}
													>
														<Link
															to={`/app/plants/plant/${plant.plant_id}`}
															className="text-green-600 hover:text-green-900"
														>
															Edit
															<span className="sr-only">, {plant.name}</span>
														</Link>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Outlet />
		</>
	);
}
