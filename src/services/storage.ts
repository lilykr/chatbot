import { createTypedStorage } from "../utils/createTypedStorage";

type PersistData = {
	hasOpenedApp: boolean;
	history: {
		type: "text" | "voice";
		id: string;
		title: string;
	}[];
};

export const storage = createTypedStorage<PersistData>();
