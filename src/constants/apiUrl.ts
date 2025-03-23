export const apiUrl =
	process.env.NODE_ENV === "development"
		? "http://localhost:8081"
		: "https://lilykr-chatbot.expo.app";
