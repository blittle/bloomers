import { Plant } from "~/services";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

type PlantTitleProps = { plant: { plant_id: number; name: string } | Plant };

export default function PlantTitle(
	props: PlantTitleProps & React.HTMLProps<HTMLDivElement>
) {
	let { plant, style = {}, className = "" } = props;

	style.position = "relative";
	className += " group z-50";

	return (
		<div {...props} style={style} className={className}>
			{plant.name}
			<InformationCircleIcon
				style={{
					position: "absolute",
					height: 24,
					width: 24,
					right: 0,
					bottom: 0,
				}}
				className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
			/>
		</div>
	);
}
