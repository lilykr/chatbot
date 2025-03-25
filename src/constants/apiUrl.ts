import * as Device from "expo-device";

export const apiUrl =
	process.env.NODE_ENV === "development" && !Device.isDevice
		? "http://localhost:8081"
		: "https://lisa-lou.expo.app";
