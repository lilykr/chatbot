import type { App } from "../types/apps";

export const getHistoryTitle = (type: App["type"]) => {
	switch (type) {
		case "chat":
			return "AI Chatbot";
		case "voiceMode":
			return "Voice Mode";
		case "rant":
			return "AI Rant";
		case "chatWithLily":
			return "Lisa-Lou's chatbot";
		default:
			return "";
	}
};

export const getHistoryContent = (item: App) => {
	switch (item.type) {
		case "chat":
		case "voiceMode":
		case "chatWithLily":
			return item.value.title;
		case "rant":
			return item.value.rantSubject;
		default:
			return "";
	}
};
