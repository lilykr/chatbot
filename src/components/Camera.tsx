import Ionicons from "@expo/vector-icons/Ionicons";
import {
	CameraView,
	useCameraPermissions,
	useMicrophonePermissions,
} from "expo-camera";
import type React from "react";
import { type LegacyRef, useEffect, useRef, useState } from "react";
import {
	Alert,
	Animated,
	Pressable,
	SafeAreaView,
	StyleSheet,
	View,
} from "react-native";

interface CameraProps {
	onClose?: () => void;
	onVideoCaptured: (videoUri: string) => void;
}

export const Camera: React.FC<CameraProps> = ({ onClose, onVideoCaptured }) => {
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [microphonePermission, requestMicrophonePermission] =
		useMicrophonePermissions();

	const [isRecording, setIsRecording] = useState(false);
	const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back");
	const [flash, setFlash] = useState(false);

	const cameraRef: LegacyRef<CameraView> | undefined = useRef(null);
	const animatedValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (!cameraRef.current) {
			return;
		}
		if (isRecording) {
			cameraRef.current.recordAsync().then((url) => {
				if (!url?.uri) {
					return alert("Erreur lors de l'enregistrement de la vidéo");
				}
				onVideoCaptured(url.uri);
			});
		} else {
			cameraRef.current.stopRecording();
		}
	}, [isRecording, onVideoCaptured]);

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: isRecording ? 1 : 0,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [isRecording, animatedValue]);

	const borderRadius = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [30, 12],
	});

	if (!cameraPermission || !microphonePermission) {
		// Camera permissions are still loading.
		return null;
	}

	if (!cameraPermission.granted) {
		if (cameraPermission.status === "undetermined") {
			requestCameraPermission();
			return null;
		}

		if (cameraPermission.status === "denied") {
			Alert.alert(
				"Permission d'utiliser la caméra refusée",
				"Veuillez autoriser la caméra dans vos réglages",
				[
					{
						text: "Fermer",
						style: "cancel",
						onPress: onClose,
					},
				],
			);
			return null;
		}

		return null;
	}
	if (!microphonePermission.granted) {
		if (microphonePermission.status === "undetermined") {
			requestMicrophonePermission();
			return null;
		}

		if (microphonePermission.status === "denied") {
			Alert.alert(
				"Permission d'utiliser le microphone refusée",
				"Veuillez autoriser le microphone dans vos réglages",
				[
					{
						text: "Fermer",
						style: "cancel",
						onPress: onClose,
					},
				],
			);
			return null;
		}
		return null;
	}

	const toggleCameraFacing = () => {
		setCameraFacing((prev) => {
			const newFacing = prev === "front" ? "back" : "front";
			if (newFacing === "front" && flash) {
				setFlash(false);
			}
			return newFacing;
		});
	};

	const toggleRecording = () => {
		setIsRecording((prev) => !prev);
	};

	const toggleFlash = () => {
		setFlash((prev) => !prev);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<View style={styles.headerSpacer} />
				<Pressable onPress={onClose} style={styles.closeButton}>
					<Ionicons name="close" size={24} color="white" />
				</Pressable>
			</View>

			<CameraView
				style={styles.camera}
				facing={cameraFacing}
				ref={cameraRef}
				mode="video"
				flash={flash ? "on" : "off"}
				enableTorch={flash}
				onMountError={(error) => {
					console.log("error", error);
				}}
			/>

			<View style={styles.controls}>
				<>
					<Pressable
						onPress={cameraFacing === "back" ? toggleFlash : undefined}
						style={[
							styles.flipButton,
							flash && styles.activeFlipButton,
							cameraFacing === "front" && styles.disabledButton,
						]}
					>
						<Ionicons
							name="flash"
							size={30}
							color={flash ? "#ffeb3b" : "white"}
							style={cameraFacing === "front" && { opacity: 0 }}
						/>
					</Pressable>
					<Pressable onPress={toggleRecording}>
						<Animated.View
							style={[styles.recordButtonInner, { borderRadius }]}
						/>
					</Pressable>
					<Pressable onPress={toggleCameraFacing} style={styles.flipButton}>
						<Ionicons name="camera-reverse" size={30} color="white" />
					</Pressable>
				</>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "black",
	},
	container: {
		flex: 1,
		justifyContent: "center",
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
		color: "white",
	},
	camera: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 20,
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},
	headerSpacer: {
		width: 40,
	},
	closeButton: {
		paddingTop: 40,
		width: 40,
		alignItems: "center",
	},
	controls: {
		position: "absolute",
		bottom: 40,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 14,
	},
	recordButtonInner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "#ff0000",
		borderWidth: 4,
		borderColor: "white",
	},
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
});
