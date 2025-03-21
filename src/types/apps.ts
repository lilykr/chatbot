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
	type: "voice";
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

export type App = ChatApp | VoiceModeApp | RantApp | ChatWithLilyApp;
