import {
	json,
	redirect,
	type ActionArgs,
	type LoaderArgs,
} from "@remix-run/cloudflare";
import { createErrorResponse } from "~/components/forms";
import {
	useActionData,
	useLoaderData,
	type ShouldReloadFunction,
} from "@remix-run/react";
import { PlantForm, restorableFields, schema } from "~/components/plantForm";

export async function loader({
	context: {
		services: { auth, plants },
	},
	params,
	request,
}: LoaderArgs) {
	const user = await auth.requireUser(request);
	const plant = await plants.getPlantById(params.plantId!, user.farm_id);

	if (!plant) {
		throw json("Plant not found", { status: 404 });
	}

	return json({ plant });
}

export async function action({
	context: {
		services: { auth, plants },
	},
	params,
	request,
}: ActionArgs) {
	const [formData, user] = await Promise.all([
		request.formData(),
		auth.requireUser(request),
	]);

	switch (formData.get("intent")) {
		case "delete":
			await plants.deletePlant(params.plantId!, user.farm_id);
			return redirect("/app/plants");
		case "update":
			const parseResult = schema.safeParse(formData);

			if (!parseResult.success) {
				return createErrorResponse(
					parseResult.error,
					restorableFields,
					formData
				);
			}

			await plants.updatePlant({
				...parseResult.data,
				maturity_days: parseInt(parseResult.data.maturity_days, 10),
				days_between_successions: parseInt(
					parseResult.data.days_between_successions,
					10
				),
				days_sowing_transplant: parseInt(
					parseResult.data.days_sowing_transplant,
					10
				),
				pinch: parseResult.data.pinch || "false",
				plant_id: parseInt(formData.get("plant_id") as string, 10),
				farm_id: user.farm_id,
			});

			return redirect("/app/plants");
		default:
			return json(null, 400);
	}
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) =>
	!!submission &&
	["/login", "/logout", "/items"].some((pathname) =>
		submission.action.startsWith(pathname)
	);

export default function NewPlant() {
	const { plant } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>() || {};

	return (
		<>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mt-4 sm:mt-4">
					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-2xl font-semibold leading-6 text-gray-900">
									Edit plant
								</h3>
								<p className="mt-6 text-sm text-gray-600">
									Warning! Changing this plant will not affect those that have
									already been planned this season!
								</p>
							</div>
						</div>
						<div className="mt-5 md:col-span-2 md:mt-0">
							<PlantForm
								showDelete
								plant={plant}
								returnPath="/app/plants"
								actionData={actionData}
							>
								<input type="hidden" name="intent" value="update" />
								<input type="hidden" name="plant_id" value={plant.plant_id} />
							</PlantForm>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
