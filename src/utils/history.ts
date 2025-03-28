import { useI18n } from "../i18n/i18n";
import type { App } from "../types/apps";

export const getHistoryTitle = (type: App["type"]) => {
	const { t } = useI18n();
	switch (type) {
		case "chat":
			return t("app.the_sassy_chatbot");
		case "voiceMode":
			return t("app.ai_voice_mode");
		case "rant":
			return t("app.ai_rant");
		case "chatWithLily":
			return t("app.lisa_lou_chatbot");
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
