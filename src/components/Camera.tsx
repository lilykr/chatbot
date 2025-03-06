import Ionicons from "@expo/vector-icons/Ionicons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { type LegacyRef, useEffect, useRef, useState } from "react";
import {
	Button,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";

interface CameraProps {
	onClose?: () => void;
	onVideoCaptured: (videoUri?: string) => void;
}

export const Camera: React.FC<CameraProps> = ({ onClose, onVideoCaptured }) => {
	const [permission, requestPermission] = useCameraPermissions();
	const [recordedVideoUri, setRecordedVideoUri] = useState<string | undefined>(
		undefined,
	);
	const [isRecording, setIsRecording] = useState(false);
	const [cameraFacing, setCameraFacing] = useState<"front" | "back">("front");

	const cameraRef: LegacyRef<CameraView> | undefined = useRef(null);

	useEffect(() => {
		if (!cameraRef.current) {
			return;
		}
		if (isRecording) {
			cameraRef.current.recordAsync().then((video) => {
				setRecordedVideoUri(video?.uri);
				onVideoCaptured(video?.uri);
			});
		} else {
			cameraRef.current.stopRecording();
		}
	}, [isRecording, onVideoCaptured]);

	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={styles.container}>
				<Text style={styles.message}>
					We need your permission to show the camera
				</Text>
				<Button onPress={requestPermission} title="grant permission" />
			</View>
		);
	}

	const toggleCameraFacing = () => {
		setCameraFacing((prev) => (prev === "front" ? "back" : "front"));
	};

	const toggleRecording = () => {
		setIsRecording((prev) => !prev);
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
			/>

			<View style={styles.controls}>
				<Pressable
					onPress={toggleRecording}
					style={[styles.recordButton, isRecording && styles.recording]}
				>
					<View style={styles.recordButtonInner} />
				</Pressable>
				<Pressable onPress={toggleCameraFacing} style={styles.flipButton}>
					<Ionicons name="camera-reverse" size={30} color="white" />
				</Pressable>
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
		width: 40, // Same width as headerButton for balance
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
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	recordButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
	},
	recordButtonInner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "#ff0000",
		borderWidth: 4,
		borderColor: "white",
	},
	recording: {
		backgroundColor: "rgba(255, 0, 0, 0.3)",
	},
	flipButton: {
		position: "absolute",
		right: 30,
		bottom: 20,
		padding: 8,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		borderRadius: 25,
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
	},
});
