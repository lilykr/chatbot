import Constants from "expo-constants";

export const generateAPIUrl = (relativePath: string) => {
	// console.log("Constants", JSON.stringify(Constants, null, 2));
	console.log(
		"process.env.EXPO_PUBLIC_API_BASE_URL",
		process.env.EXPO_PUBLIC_API_BASE_URL,
	);
	const origin = Constants.experienceUrl.replace(
		"om.lilykr.chatbot://",
		"http://",
	);

	const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

	if (process.env.NODE_ENV === "development") {
		return origin.concat(path);
	}

	if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
		throw new Error(
			"EXPO_PUBLIC_API_BASE_URL environment variable is not defined",
		);
	}

	return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
