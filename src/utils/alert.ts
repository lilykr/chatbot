import { Alert, Platform } from "react-native";

type AlertButton = {
	text: string;
	onPress?: () => void;
	style?: "default" | "cancel" | "destructive";
};

/**
 * Cross-platform alert function that works on both native and web
 */
export const showAlert = (
	title: string,
	message: string,
	buttons: AlertButton[] = [{ text: "OK" }],
): void => {
	if (Platform.OS === "web") {
		// On web, use the browser's alert API
		// For simplicity, we'll just show the title and message
		// and handle the first button's onPress if provided
		const confirmed = window.confirm(`${title}\n\n${message}`);

		if (confirmed) {
			// Find the first non-cancel button and call its onPress
			const confirmButton = buttons.find((button) => button.style !== "cancel");
			if (confirmButton?.onPress) {
				confirmButton.onPress();
			}
		} else {
			// If user cancels, find the cancel button and call its onPress
			const cancelButton = buttons.find((button) => button.style === "cancel");
			if (cancelButton?.onPress) {
				cancelButton.onPress();
			}
		}
	} else {
		// On native, use React Native's Alert API
		Alert.alert(title, message, buttons);
	}
};
