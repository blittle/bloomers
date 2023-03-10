import { useEffect, useRef, useState } from "react";
import {
	redirect,
	type ActionArgs,
	type LoaderArgs,
} from "@remix-run/cloudflare";
import { useActionData } from "@remix-run/react";

import { createErrorResponse } from "~/components/forms";
import { PlantForm, restorableFields, schema } from "~/components/plantForm";

export async function loader({
	context: {
		services: { auth },
	},
	request,
}: LoaderArgs) {
	await auth.requireUser(request);
	return null;
}

export async function action({
	context: {
		services: { auth, plants },
	},
	request,
}: ActionArgs) {
	const [formData, user] = await Promise.all([
		request.formData(),
		auth.requireUser(request),
	]);
	const parseResult = schema.safeParse(formData);

	if (!parseResult.success) {
		return createErrorResponse(parseResult.error, restorableFields, formData);
	}

	const itemId = await plants.addPlant({
		farm_id: user.farm_id,
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
	});

	return redirect("/app/plants");
}

export default function NewPlant() {
	const actionData = useActionData<typeof action>() || {};

	return (
		<>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="mt-4 sm:mt-4">
					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-2xl font-semibold leading-6 text-gray-900">
									New plant
								</h3>
								<p className="mt-6 text-sm text-gray-600">
									Add a plant into the system. You'll be able to use the plant
									when planning your fields and sowing schedules.
								</p>
							</div>
						</div>
						<div className="mt-5 md:col-span-2 md:mt-0">
							<PlantForm returnPath="/app/plants" actionData={actionData} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
