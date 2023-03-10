export function getRedirectTo(searchParams: URLSearchParams, fallback = "/") {
	let redirect = searchParams.get("redirectTo") || fallback;
	redirect = redirect.trim();
	if (redirect.startsWith("//") || redirect.startsWith("http")) {
		redirect = fallback;
	}
	return redirect || fallback;
}

export function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

export const PRODUCTION_LEVEL = {
	OHW: "One hit wonder",
	MP: "Medium producer",
	CC: "Continuous cut",
};
