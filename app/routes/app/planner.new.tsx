import { json, LoaderArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import React, { useState, useMemo, useRef, useEffect } from "react";
import CustomProperties from "~/components/CustomProperties";
import PlantTitle from "~/components/PlantTitle";
import { Plant } from "~/services";

const COLORS = [
	{
		name: "Red",
		value: "#FF4136",
	},
	{
		name: "Blue",
		value: "#0074D9",
	},
	{
		name: "Orange",
		value: "#FF851B",
	},
	{
		name: "Pink",
		value: "#FFC0CB",
	},
	{
		name: "Yellow",
		value: "#FFDC00",
	},
	{
		name: "Purple",
		value: "#B10DC9",
	},
	{
		name: "Green",
		value: "#2ECC40",
	},
];

export async function loader({
	context: {
		services: { auth, plants },
	},
	request,
}: LoaderArgs) {
	const user = await auth.requireUser(request);
	const allPlants = await plants.getAllPlants(user?.farm_id);

	return json({
		plants: allPlants,
		user,
	});
}

export default function Example() {
	const { plants } = useLoaderData<typeof loader>();
	const [selectedPlantId, setSelectedPlantId] = useState("");
	const selectedPlant = useMemo(
		() => plants.find((plant) => plant.plant_id + "" === selectedPlantId),
		[plants, selectedPlantId]
	);

	const sowings = useMemo(() => {
		const sowings = selectedPlant ? getPlantSowings(selectedPlant) : null;
		return sowings;
	}, [selectedPlant]);

	const [dateFilter, setDateFilter] = useState("sowing");
	const [name, setName] = useState("");
	const [mouseAnchor, setMouseAnchor] = useState(0);
	const calRef = useRef<HTMLDivElement>();
	const [customProperties, setCustomProperties] = useState<Array<string>>([]);
	const [showName, setShowName] = useState(false);

	useEffect(() => {
		if (selectedPlant) {
			setName(selectedPlant.name);
		}
	}, [selectedPlant]);

	return (
		<form className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" autoComplete="off">
			<div className=" bg-white shadow sm:rounded-lg mx-8 pb-8">
				<div className="px-4 py-5 sm:px-6">
					<h3 className="text-base font-semibold leading-6 text-gray-900">
						Plan for a new flower planting this season
					</h3>
					<p className="mt-1 max-w-2xl text-sm text-gray-500">
						Enter the details for your flower crop
					</p>
				</div>
				<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
					<dl className="sm:divide-y sm:divide-gray-200">
						<div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
							<label
								className="text-sm font-medium text-gray-500"
								htmlFor="plantVariety"
							>
								Flower variety
							</label>
							<div className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
								<div className="flex items-center flex-col sm:flex-row">
									<select
										id="plantVariety"
										name="plantVariety"
										onChange={(e) => setSelectedPlantId(e.target.value)}
										value={selectedPlantId}
										className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
										required
									>
										<option value="" disabled>
											Select variety
										</option>
										{plants.map((plant) => (
											<option value={plant.plant_id} key={plant.plant_id}>
												{plant.name}
											</option>
										))}
									</select>

									<div className="mx-2">
										<button
											className="w-32 h-10 hover:underline"
											type="button"
											onClick={() => setShowName(true)}
										>
											Custom name
										</button>
									</div>
									{showName ? (
										<input
											type="text"
											name="name"
											id="name"
											value={name}
											autoFocus
											onChange={(e) => setName(e.target.value)}
											className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 max-w-md"
										/>
									) : null}
								</div>
							</div>
						</div>
						<div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
							<label
								className="text-sm font-medium text-gray-500"
								htmlFor="sowingType"
							>
								Sowing type
							</label>
							<div className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
								<fieldset>
									<legend className="sr-only">Plan</legend>
									<div className="grid grid-cols-2">
										<div className="relative flex items-start">
											<div className="flex h-6 items-center">
												<input
													id={"indoor"}
													aria-describedby={`indoor-description`}
													name="plan"
													type="radio"
													value="indoor"
													className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-600"
												/>
											</div>
											<div className="ml-3 text-sm leading-6">
												<label
													htmlFor="indoor"
													className="font-medium text-gray-900"
												>
													Indoor
												</label>
												<p id={`indoor-description`} className="text-gray-500">
													This flower will be sowed indoors and subsequently
													transplanted outside. An extra transplant date will be
													generated.
												</p>
											</div>
										</div>

										<div className="relative flex items-start">
											<div className="flex h-6 items-center">
												<input
													id={"outdoor"}
													aria-describedby={`outdoor-description`}
													name="plan"
													type="radio"
													value="outdoor"
													className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-600"
												/>
											</div>
											<div className="ml-3 text-sm leading-6">
												<label
													htmlFor="outdoor"
													className="font-medium text-gray-900"
												>
													Outdoor
												</label>
												<p id={`outdoor-description`} className="text-gray-500">
													The flower will be sowed directly outdoors.
												</p>
											</div>
										</div>
									</div>
								</fieldset>
							</div>
						</div>
						<div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
							<label
								className="text-sm font-medium text-gray-500"
								htmlFor="color"
							>
								Color
							</label>
							<div className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
								<select
									id="color"
									name="color"
									required
									className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6 max-w-xs"
								>
									<option value="" disabled>
										Select color
									</option>
									{COLORS.map((color) => (
										<option key={color.name}>{color.name}</option>
									))}
								</select>
							</div>
						</div>
						<div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
							<CustomProperties
								customProperties={customProperties}
								setCustomProperties={setCustomProperties}
							/>
						</div>
						<div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
							<dt className="text-sm font-medium text-gray-500">Image</dt>
							<dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
								<div className="flex max-w-lg justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
									<div className="space-y-1 text-center">
										<svg
											className="mx-auto h-12 w-12 text-gray-400"
											stroke="currentColor"
											fill="none"
											viewBox="0 0 48 48"
											aria-hidden="true"
										>
											<path
												d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
												strokeWidth={2}
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										<div className="flex text-sm text-gray-600">
											<label
												htmlFor="file-upload"
												className="relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500"
											>
												<span>Upload a file</span>
												<input
													id="file-upload"
													name="file-upload"
													type="file"
													className="sr-only"
												/>
											</label>
											<p className="pl-1">or drag and drop</p>
										</div>
										<p className="text-xs text-gray-500">
											PNG, JPG, GIF up to 10MB
										</p>
									</div>
								</div>
							</dd>
						</div>
						{selectedPlant ? (
							<div className="overflow-auto relative pb-8" ref={calRef}>
								<div className="pt-8" style={{ width: 1100 }}>
									<div className="flex flex-row w-full">
										<div style={{ width: "280px" }}>
											<div className="text-xs">
												<fieldset className="ml-4">
													<div className="sm:flex sm:items-center">
														<div className="flex items-center mr-1">
															<input
																id="sowing"
																name="notification-method"
																type="radio"
																onChange={() => setDateFilter("sowing")}
																checked={dateFilter === "sowing"}
																className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-600"
															/>
															<label
																htmlFor="sowing"
																className="ml-1 block text-xs font-medium text-gray-900"
															>
																Sow
															</label>
														</div>
														<div className="flex items-center mr-1">
															<input
																id="bloom-start"
																name="notification-method"
																type="radio"
																onChange={() => setDateFilter("startBloom")}
																checked={dateFilter === "startBloom"}
																className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-600"
															/>
															<label
																htmlFor="bloom-start"
																className="ml-1 block text-xs font-medium text-gray-900"
															>
																Bloom
															</label>
														</div>
														<div className="flex items-center">
															<input
																id="bloom-end"
																name="notification-method"
																type="radio"
																onChange={() => setDateFilter("endBloom")}
																checked={dateFilter === "endBloom"}
																className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-600"
															/>
															<label
																htmlFor="bloom-end"
																className="ml-1 block text-xs font-medium text-gray-900"
															>
																End
															</label>
														</div>
													</div>
												</fieldset>
											</div>
										</div>
										<div className="relative w-full">
											<div
												className="grid grid-cols-12 text-xs absolute w-full"
												style={{ height: 84 }}
											>
												<div className="border-x text-center px-1">January</div>
												<div className="border-r text-center px-1">
													February
												</div>
												<div className="border-r text-center px-1">March</div>
												<div className="border-r text-center px-1">April</div>
												<div className="border-r text-center px-1">May</div>
												<div className="border-r text-center px-1">June</div>
												<div className="border-r text-center px-1">July</div>
												<div className="border-r text-center px-1">August</div>
												<div className="border-r text-center px-1">
													September
												</div>
												<div className="border-r text-center px-1">October</div>
												<div className="border-r text-center px-1">
													November
												</div>
												<div className="border-r text-center px-1">
													December
												</div>
											</div>
										</div>
									</div>

									<div
										className="flex flex-row mt-4 pr-"
										style={{ width: 1100 }}
									>
										<div className="" style={{ width: 280 }}>
											<PlantTitle
												plant={selectedPlant}
												className="text-center text-ellipsis whitespace-nowrap overflow-hidden pl-4"
												style={{ width: 212 }}
											/>
										</div>
										<div className="relative">
											<div
												className="bg-slate-500 absolute"
												style={{
													height: 16,
													top: 4,
													...getSowingSize(sowings!),
												}}
											></div>
											{sowings!.map((sowing, index) => (
												<React.Fragment key={index}>
													<div
														title={`Sowing ${index + 1} - ${fD(
															sowing[dateFilter as "sowing"]
														)}`}
														className="absolute bg-red-400"
														style={{
															top: 4,
															width: 4,
															height: 16,
															left: getDateSize(sowing[dateFilter as "sowing"]),
														}}
													></div>
												</React.Fragment>
											))}
										</div>
									</div>
									<div
										className="flex flex-row mt-4 absolute"
										style={{
											width: 1100,
											top: 40,
											height: "calc(100% - 60px)",
										}}
									>
										<div
											className="text-center text-ellipsis whitespace-nowrap overflow-hidden pl-4"
											style={{ width: 280 }}
										></div>
										<div
											className="relative w-full"
											onMouseMove={(e) => {
												const rect = (e.target as any).getBoundingClientRect();
												const x = e.clientX - rect.left;
												if (x > 1) {
													setMouseAnchor(x);
												}
											}}
										>
											<div
												className="h-full absolute bg-gray-700"
												style={{
													width: 2,
													left: mouseAnchor,
												}}
											></div>
										</div>
									</div>
								</div>
							</div>
						) : null}
						<div className="flex flex-row-reverse pt-8 pr-8 items-center">
							<button
								type="submit"
								className="disabled:bg-gray-400 rounded-md bg-green-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
							>
								Review plant dates
							</button>
							<Link to="/app/planner" className="mr-8 hover:underline">
								Discard draft
							</Link>
						</div>
					</dl>
				</div>
			</div>
		</form>
	);
}

function getSowingSize(
	sowings: Array<{ sowing: Date; startBloom: Date; endBloom: Date }>
) {
	const left = getDateSize(sowings![0].sowing);
	const width = getDateSize(sowings![sowings!.length - 1].endBloom) - left;

	return { left, width };
}

function getDateSize(date: Date) {
	const x = 72.833333333333333;
	return date.getMonth() * x + (date.getDate() / 30) * x - 68;
}

const DAY = 1000 * 60 * 60 * 24;

const firstFrostDate = new Date();
const lastFrostDate = new Date();

// 10/5/23
firstFrostDate.setMonth(9);
firstFrostDate.setDate(5);

// 05/10/23
lastFrostDate.setMonth(4);
lastFrostDate.setDate(10);

function fD(date: Date) {
	return `${date.getMonth() + 1}-${date.getDate()}`;
}

function getPlantSowings(plant: Plant) {
	const sowings = [];

	let transplantDate = getDateOfThisYear(plant.default_first_transplant_date);

	while (true) {
		const sowing = getSowingDates(transplantDate, plant);
		transplantDate = new Date(
			sowing.sowing.getTime() + plant.days_between_successions * DAY
		);

		const { maturity_days, days_between_successions } = plant;

		if (
			sowing.sowing.getTime() +
				(maturity_days + days_between_successions) * DAY >
			firstFrostDate.getTime()
		) {
			break;
		}

		sowings.push(sowing);
	}

	return sowings;
}

function getSowingDates(transplantDate: Date, plant: Plant) {
	// @todo - override first transplant date
	const { maturity_days, days_sowing_transplant, days_between_successions } =
		plant;

	const sowing = new Date(
		transplantDate.getTime() - DAY * days_sowing_transplant
	);

	const startBloom = new Date(sowing.getTime() + maturity_days * DAY);

	const endBloom = new Date(
		sowing.getTime() + maturity_days * DAY + days_between_successions * DAY
	);

	return {
		sowing,
		startBloom,
		endBloom,
	};
}

function getDateOfThisYear(date: Date | string) {
	const _date = typeof date === "string" ? new Date(date) : date;
	_date.setFullYear(new Date().getFullYear());
	return _date;
}
