import { IMAGES } from "../constants/images";
import type { AppType } from "../types/apps";

export const getAppImage = (type: AppType) => {
	switch (type) {
		case "chatWithLily":
			return IMAGES.LLK_AVATAR;
		case "voiceMode":
			return IMAGES.MICROPHONE;
		case "rant":
			return IMAGES.ANGRY;
		default:
			return IMAGES.LOGO;
	}
};
