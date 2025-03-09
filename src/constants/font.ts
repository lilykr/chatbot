import { Platform } from "react-native";

export const font = {
	regular: Platform.OS === "ios" ? "Epilogue-Regular" : "Epilogue_400Regular",
	medium: Platform.OS === "ios" ? "Epilogue-Medium" : "Epilogue_500Medium",
	bold: Platform.OS === "ios" ? "Epilogue-ExtraBold" : "Epilogue_800ExtraBold",
};
