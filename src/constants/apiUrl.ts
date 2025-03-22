import { TARGET_LOCALHOST } from "./features";

export const apiUrl = TARGET_LOCALHOST
	? "http://localhost:8081"
	: "https://lilykr-chatbot.expo.app";
