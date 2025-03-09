import {
	PermissionStatus,
	useCameraPermissions as useExpoCameraPermissions,
	useMicrophonePermissions,
} from "expo-camera";
import { Alert } from "react-native";

interface UseCameraPermissionsResult {
	hasPermissions: boolean;
	requestPermissions: () => void;
}

export const useCameraPermissions = (
	onPermissionDenied: () => void,
): UseCameraPermissionsResult => {
	const [cameraPermission, requestCameraPermission] =
		useExpoCameraPermissions();
	const [microphonePermission, requestMicrophonePermission] =
		useMicrophonePermissions();

	if (!cameraPermission || !microphonePermission) {
		return {
			hasPermissions: false,
			requestPermissions: () => {},
		};
	}

	if (!cameraPermission.granted) {
		if (cameraPermission.status === PermissionStatus.UNDETERMINED) {
			return {
				hasPermissions: false,
				requestPermissions: requestCameraPermission,
			};
		}

		if (cameraPermission.status === PermissionStatus.DENIED) {
			if (cameraPermission.canAskAgain) {
				return {
					hasPermissions: false,
					requestPermissions: requestCameraPermission,
				};
			}
			Alert.alert(
				"Permission d'utiliser la caméra refusée",
				"Veuillez autoriser la caméra dans vos réglages",
				[
					{
						text: "Fermer",
						style: "cancel",
						onPress: onPermissionDenied,
					},
				],
			);
			return {
				hasPermissions: false,
				requestPermissions: () => {},
			};
		}
	}

	if (!microphonePermission.granted) {
		if (microphonePermission.status === PermissionStatus.UNDETERMINED) {
			return {
				hasPermissions: false,
				requestPermissions: requestMicrophonePermission,
			};
		}

		if (microphonePermission.status === PermissionStatus.DENIED) {
			if (microphonePermission.canAskAgain) {
				return {
					hasPermissions: false,
					requestPermissions: requestMicrophonePermission,
				};
			}
			Alert.alert(
				"Permission d'utiliser le microphone refusée",
				"Veuillez autoriser le microphone dans vos réglages",
				[
					{
						text: "Fermer",
						style: "cancel",
						onPress: onPermissionDenied,
					},
				],
			);
			return {
				hasPermissions: false,
				requestPermissions: () => {},
			};
		}
	}

	return {
		hasPermissions: true,
		requestPermissions: () => {},
	};
};
