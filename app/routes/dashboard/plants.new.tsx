import { useEffect, useRef, useState } from "react";
import {
	redirect,
	type ActionArgs,
	type LoaderArgs,
} from "@remix-run/cloudflare";
import { useActionData, useLocation, useTransition } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { DetailsHeader, DetailsSection } from "~/components/dashboard";
import {
	CheckBox,
	createErrorResponse,
	DateInput,
	discardDraft,
	DraftForm,
	NumberInput,
	SelectInput,
	TextInput,
} from "~/components/forms";
import { buttonStyles } from "~/components/buttons";

const restorableFields = [
	"label",
	"name",
	"sow_preference",
	"spacing",
	"germ_brightness",
	"germ_temp",
	"pinch",
	"support",
	"maturity_days",
	"days_between_successions",
	"production_level",
	"days_sowing_transplant",
	"default_first_transplant_date",
];

const schema = zfd.formData({
	name: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.refine((s) => s.length > 0, "Can't be just whitespace characters")
	),
	sow_preference: zfd.text(z.enum(["OUTDOOR", "INDOOR"])),
	spacing: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.refine((n) => parseInt(n, 10) > 0, "Must be a number greater than 0")
	),
	germ_brightness: zfd.text(z.enum(["DARK", "LIGHT"])),
	germ_temp: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.refine((n) => parseInt(n, 10) > 0, "Must be a number greater than 0")
	),
	pinch: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.optional()
	),
	support: zfd.text(z.enum(["NONE", "NET", "CORRAL"])),
	maturity_days: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.refine((n) => parseInt(n, 10) > 0, "Must be a number greater than 0")
	),
	days_between_successions: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.refine((n) => parseInt(n, 10) > 0, "Must be a number greater than 0")
	),
	production_level: zfd.text(z.enum(["CC", "OHW", "MP"])),
	days_sowing_transplant: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.refine((n) => parseInt(n, 10) > 0, "Must be a number greater than 0")
	),
	default_first_transplant_date: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.transform((s) => s.trim())
			.refine((s) => s.length > 0, "Must provide a date")
	),
});

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

	return redirect("/dashboard/plants");
}

export default function NewItem() {
	const { errors, restorable } = useActionData<typeof action>() || {};
	const [formKey, setFormKey] = useState(0);
	const formRef = useRef<HTMLFormElement>(null);

	const location = useLocation();
	const transition = useTransition();
	useEffect(() => {
		const form = formRef.current;
		return () => {
			if (
				transition.state == "loading" &&
				transition.type == "actionRedirect" &&
				transition.submission.action == location.pathname
			) {
				discardDraft(form);
			}
		};
	}, [transition, location]);

	return (
		<DetailsSection id="dashboard-new-plant">
			<DetailsHeader
				label="New plant"
				actions={[
					{
						label: "Discard Draft",
						icon: "🚮",
						onClick: (event) => {
							discardDraft(formRef.current);
							setFormKey((key) => key + 1);
							event.preventDefault();
						},
					},
				]}
			/>

			<DraftForm
				key={formKey}
				className="p-4 h-full flex flex-col"
				method="post"
				id="new-plant-form"
				ref={formRef}
				errors={errors}
				restorable={restorable}
			>
				<div className="flex-1 overflow-auto">
					<TextInput
						id="plant-name-input"
						name="name"
						required
						minLength={1}
						placeholder="Plant name"
						autoFocus
					>
						Name
					</TextInput>
					<SelectInput
						id="plant-sow-preference-input"
						name="sow_preference"
						required
						header={"Sow preference"}
					>
						<option value="INDOOR">Indoor</option>
						<option value="OUTDOOR">Outdoor</option>
					</SelectInput>
					<NumberInput
						id="plant-spacing-input"
						name="spacing"
						required
						placeholder="Spacing (inches) in between plants"
					>
						Spacing
					</NumberInput>
					<SelectInput
						id="plant-germ-brightness-select"
						name="germ_brightness"
						required
						header={"Germination brightness"}
					>
						<option value="LIGHT">Light</option>
						<option value="DARK">Dark</option>
					</SelectInput>
					<NumberInput
						id="plant-germ-temp-input"
						name="germ_temp"
						required
						placeholder="Degrees F"
					>
						Germination temperature
					</NumberInput>
					<CheckBox id="plant-pinch-input" name="pinch" value="true">
						Pinched
					</CheckBox>
					<SelectInput
						id="plant-support-select"
						name="support"
						required
						header={"Support"}
					>
						<option value="NONE">None</option>
						<option value="NET">Net</option>
						<option value="CORRAL">Corral</option>
					</SelectInput>
					<NumberInput
						id="plant-maturity-input"
						name="maturity_days"
						required
						placeholder="Days"
					>
						Days to Maturity
					</NumberInput>
					<NumberInput
						id="plant-succession-input"
						name="days_between_successions"
						required
						placeholder="Days"
					>
						Days between successions
					</NumberInput>
					<SelectInput
						id="plant-production-select"
						name="production_level"
						required
						header={"Production level"}
					>
						<option value="MP">Medium producer</option>
						<option value="CC">Continuous cut</option>
						<option value="OHW">One hit wonder</option>
					</SelectInput>
					<NumberInput
						id="plant-sowing-transplant-input"
						name="days_sowing_transplant"
						required
						placeholder="Days"
					>
						Days in between sowing and transplant
					</NumberInput>
					<DateInput
						id="plant-default-transplant-date-input"
						name="default_first_transplant_date"
						required
					>
						Default first transplant date
					</DateInput>
				</div>
				<div className="mb-20">
					<button type="submit" className={buttonStyles()}>
						Create
					</button>
				</div>
			</DraftForm>
		</DetailsSection>
	);
}
