import { createTypedStorage } from "../utils/createTypedStorage";
import type { App, ChatApp, VoiceModeApp, RantApp } from "../types/apps";

export type HistoryItem<T extends App["type"] = App["type"]> = (T extends "chat"
	? ChatApp
	: T extends "voice"
		? VoiceModeApp
		: T extends "rant"
			? RantApp
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
