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
	Text,
	View,
} from "react-native";

interface CameraProps {
	onClose: () => void;
	onVideoCaptured: (videoUri: string) => void;
}

export const Camera: React.FC<CameraProps> = ({ onClose, onVideoCaptured }) => {
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [microphonePermission, requestMicrophonePermission] =
		useMicrophonePermissions();
	const [isRecording, setIsRecording] = useState(false);
	const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back");
	const [flash, setFlash] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);

	const timerRef = useRef<NodeJS.Timeout>();
	const cameraRef: LegacyRef<CameraView> | undefined = useRef(null);
	const animatedValue = useRef(new Animated.Value(0)).current;
	const isManualClosing = useRef(false);

	useEffect(() => {
		if (!cameraRef.current) {
			return;
		}
		if (isRecording) {
			cameraRef.current.recordAsync({ maxDuration: 30 }).then((url) => {
				if (isManualClosing.current) return;
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

	useEffect(() => {
		if (isRecording) {
			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			setRecordingTime(0);
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isRecording]);

	const borderRadius = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [30, 12],
	});

	const scale = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [1, 0.6],
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

	const onCloseCamera = () => {
		isManualClosing.current = true;
		onClose();
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<View style={styles.headerSpacer} />
				<View style={styles.timerContainer}>
					<Text style={styles.timerText}>
						{Math.floor(recordingTime / 60)}:
						{(recordingTime % 60).toString().padStart(2, "0")}
					</Text>
				</View>
				<Pressable onPress={onCloseCamera} style={styles.closeButton}>
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
						<View>
							<Animated.View
								style={[
									styles.recordButtonInner,
									{
										borderRadius,
										transform: [{ scale }],
									},
								]}
							/>
							<View style={[styles.recordButtonBorder]} />
						</View>
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
	},
	headerSpacer: {
		width: 40,
	},
	closeButton: {
		width: 40,
		alignItems: "center",
	},
	controls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 14,
		paddingTop: 20,
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
	timerContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	timerText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});
