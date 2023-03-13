import { useState } from "react";

export default function CustomProperties({
	customProperties,
	setCustomProperties,
}: {
	customProperties: Array<string>;
	setCustomProperties: React.Dispatch<React.SetStateAction<string[]>>;
}) {
	const [newCustomProperty, setNewCustomProperty] = useState("");
	return (
		<>
			<label
				className="text-sm font-medium text-gray-500"
				htmlFor="customProperty"
			>
				Custom properties
			</label>
			<div className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
				<div className="divide-y divide-gray-200 mb-4">
					{customProperties.map((property, index) => (
						<div className="py-4" key={index + property}>
							<div className="flex items-center space-x-4">
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm text-gray-900">{property}</p>
								</div>
								<div>
									<button
										onClick={(e) => {
											customProperties.splice(index, 1);
											setCustomProperties([...customProperties]);
										}}
										className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs text-gray-900 hover:bg-gray-50"
									>
										Remove
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
				<div className="flex">
					<input
						type="text"
						name="customProperty"
						id="customProperty"
						placeholder="Add something custom about this flower"
						value={newCustomProperty}
						onChange={(e) => setNewCustomProperty(e.target.value)}
						onKeyDown={(e) => {
							if (e.code === "Enter") {
								if (newCustomProperty.trim()) {
									setCustomProperties([...customProperties, newCustomProperty]);
									setNewCustomProperty("");
								}
								e.preventDefault();
								return false;
							}
						}}
						className="mr-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
					/>
					<button
						type="button"
						onClick={() => {
							if (newCustomProperty.trim()) {
								setCustomProperties([...customProperties, newCustomProperty]);
								setNewCustomProperty("");
							}
						}}
						className="rounded-md bg-white py-1.5 px-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 border-none"
					>
						Add
					</button>
				</div>
			</div>
		</>
	);
}
