import { Platform } from "react-native";

export const font = {
	regular: Platform.OS === "ios" ? "Epilogue-Regular" : "Epilogue_400Regular",
	medium: Platform.OS === "ios" ? "Epilogue-Medium" : "Epilogue_500Medium",
	semibold:
		Platform.OS === "ios" ? "Epilogue-SemiBold" : "Epilogue_600SemiBold",
	bold: Platform.OS === "ios" ? "Epilogue-Bold" : "Epilogue_700Bold",
};
