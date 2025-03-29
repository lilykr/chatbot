import type { UIMessage } from "ai";

export type ChatApp = {
	type: "chat";
	value: {
		title: string;
		messages: UIMessage[];
	};
};

export type ChatWithLilyApp = {
	type: "chatWithLily";
	value: {
		title: string;
		messages: UIMessage[];
	};
};

export type VoiceModeApp = {
	type: "voiceMode";
	value: {
		title: string;
		messages: UIMessage[];
	};
};

export type RantApp = {
	type: "rant";
	value: {
		rantSubject: string;
		rantText: string;
	};
};

export type RoastApp = {
	type: "roast";
	value: {
		roastTitle: string;
		imageRoast: string;
	};
};

export type App = ChatApp | VoiceModeApp | RantApp | RoastApp | ChatWithLilyApp;
export type AppType = App["type"];
