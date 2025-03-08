import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	flipButton: {
		padding: 8,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		borderRadius: 25,
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
	},
	activeFlipButton: {
		backgroundColor: "rgba(255, 235, 59, 0.3)",
	},
	disabledButton: {
		opacity: 0,
	},
	recordButtonInner: {
		backgroundColor: "#ff0000",
		width: 60,
		height: 60,
	},
	recordButtonBorder: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 4,
		borderColor: "white",
		position: "absolute",
	},
});
