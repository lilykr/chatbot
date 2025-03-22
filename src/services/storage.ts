import type {
	App,
	ChatApp,
	ChatWithLilyApp,
	RantApp,
	VoiceModeApp,
} from "../types/apps";
import { createTypedStorage } from "../utils/createTypedStorage";

export type HistoryItem<T extends App["type"] = App["type"]> = (T extends "chat"
	? ChatApp
	: T extends "voiceMode"
		? VoiceModeApp
		: T extends "rant"
			? RantApp
			: T extends "chatWithLily"
				? ChatWithLilyApp
				: App) & {
	id: string;
	createdAt: number;
	updatedAt: number;
};

type PersistData = {
	hasOpenedApp: boolean;
	history: HistoryItem[];
};

export const storage = createTypedStorage<PersistData>();
