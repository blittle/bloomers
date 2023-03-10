import {
	Form,
	useLocation,
	useNavigate,
	useTransition,
} from "@remix-run/react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Plant } from "~/services";
import {
	CheckBox,
	DateInput,
	discardDraft,
	DraftForm,
	NumberInput,
	SelectInput,
	TextInput,
} from "./forms";

export function PlantForm({
	plant,
	returnPath,
	actionData,
	children,
	showDelete = false,
}: {
	plant?: Plant;
	returnPath: string;
	actionData: any;
	children?: ReactNode;
	showDelete?: boolean;
}) {
	const [formKey, setFormKey] = useState(0);
	const formRef = useRef<HTMLFormElement>(null);
	const { errors, restorable } = actionData;

	const location = useLocation();
	const transition = useTransition();
	const navigate = useNavigate();
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
		<DraftForm
			key={formKey}
			className="p-4 h-full flex flex-col"
			method="post"
			id={"plant-" + (plant ? plant?.plant_id : "")}
			ref={formRef}
			errors={errors}
			restorable={restorable}
		>
			<div className="overflow-hidden shadow sm:rounded-md">
				<div className="bg-white px-4 py-5 sm:p-6">
					<div className="grid grid-cols-6 gap-6">
						<div className="col-span-6">
							<TextInput
								id="plant-name-input"
								name="name"
								required
								minLength={1}
								defaultValue={plant?.name}
								placeholder="Plant name"
								autoFocus
							>
								Name
							</TextInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<SelectInput
								id="plant-sow-preference-input"
								name="sow_preference"
								defaultValue={plant?.sow_preference}
								required
								header={"Sow preference"}
							>
								<option value="INDOOR">Indoor</option>
								<option value="OUTDOOR">Outdoor</option>
							</SelectInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<SelectInput
								id="plant-germ-brightness-select"
								name="germ_brightness"
								defaultValue={plant?.germ_brightness}
								required
								header={"Germination brightness"}
							>
								<option value="LIGHT">Light</option>
								<option value="DARK">Dark</option>
							</SelectInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<NumberInput
								id="plant-spacing-input"
								name="spacing"
								defaultValue={plant?.spacing}
								required
								placeholder="Spacing (inches) in between plants"
							>
								Spacing
							</NumberInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<TextInput
								id="plant-germ-temp-input"
								name="germ_temp"
								defaultValue={plant?.germ_temp}
								required
								placeholder="Degrees F"
							>
								Germination temperature
							</TextInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<NumberInput
								id="plant-maturity-input"
								name="maturity_days"
								defaultValue={plant?.maturity_days}
								required
								placeholder="Days"
							>
								Days to Maturity
							</NumberInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<NumberInput
								id="plant-succession-input"
								name="days_between_successions"
								defaultValue={plant?.days_between_successions}
								required
								placeholder="Days"
							>
								Days between successions
							</NumberInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<SelectInput
								id="plant-support-select"
								name="support"
								defaultValue={plant?.support}
								required
								header={"Support"}
							>
								<option value="NONE">None</option>
								<option value="NET">Net</option>
								<option value="CORRAL">Corral</option>
								<option value="UNKNOWN">Unknown</option>
							</SelectInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<SelectInput
								id="plant-production-select"
								name="production_level"
								defaultValue={plant?.production_level}
								required
								header={"Production level"}
							>
								<option value="MP">Medium producer</option>
								<option value="CC">Continuous cut</option>
								<option value="OHW">One hit wonder</option>
							</SelectInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<NumberInput
								id="plant-sowing-transplant-input"
								name="days_sowing_transplant"
								defaultValue={plant?.days_sowing_transplant}
								required
								placeholder="Days"
							>
								Days in between sowing and transplant
							</NumberInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<DateInput
								id="plant-default-transplant-date-input"
								name="default_first_transplant_date"
								defaultValue={plant?.default_first_transplant_date}
								required
							>
								Default first transplant date
							</DateInput>
						</div>
						<div className="col-span-6 sm:col-span-3">
							<CheckBox
								id="plant-pinch-input"
								name="pinch"
								value="true"
								defaultChecked={plant?.pinch === "true"}
								defaultValue={!!plant?.pinch + ""}
							>
								Pinched
							</CheckBox>
						</div>
						{children}
					</div>
				</div>
				<div className="flex bg-gray-50 px-4 py-3 sm:px-6 items-center">
					<div className="flex-1">
						{showDelete ? (
							<Form method="post">
								<input type="hidden" name="intent" value="delete" />
								<button
									onSubmit={(event) => {
										discardDraft(formRef.current);
										setFormKey((key) => key + 1);
									}}
									className="mr-8 hover:underline text-red-700"
								>
									Delete plant
								</button>
							</Form>
						) : null}
					</div>
					<button
						onClick={(event) => {
							discardDraft(formRef.current);
							setFormKey((key) => key + 1);
							event.preventDefault();
							navigate(returnPath);
						}}
						className="mr-8 hover:underline"
					>
						Discard draft
					</button>
					<button
						type="submit"
						className="inline-flex justify-center rounded-md bg-green-600 py-2 px-6 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
					>
						Save
					</button>
				</div>
			</div>
		</DraftForm>
	);
}

export const restorableFields = [
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

export const schema = zfd.formData({
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
			.refine((s) => s.length > 0, "Can't be just whitespace characters")
	),
	pinch: zfd.text(
		z
			.string()
			.transform((s) => s.trim())
			.optional()
	),
	support: zfd.text(z.enum(["NONE", "NET", "CORRAL", "UNKNOWN"])),
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
