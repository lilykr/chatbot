import { type CameraOrientation, CameraView } from "expo-camera";
import type React from "react";
import { type LegacyRef, useEffect, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	Easing,
	Platform,
	SafeAreaView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { CloseButton } from "./CloseButton";
import { FlashButton } from "./FlashButton";
import { FlipCameraButton } from "./FlipCameraButton";
import { RecordButton } from "./RecordButton";
import { useCameraPermissions } from "./hooks/useCameraPermissions";

interface CameraProps {
	onClose: () => void;
	onVideoCaptured: (videoUri: string) => void;
}

export const Camera: React.FC<CameraProps> = ({ onClose, onVideoCaptured }) => {
	const { hasPermissions, requestPermissions } = useCameraPermissions(onClose);
	const [isRecording, setIsRecording] = useState(false);
	const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back");
	const [flash, setFlash] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [orientation, setOrientation] = useState<CameraOrientation | undefined>(
		undefined,
	);

	const timerRef = useRef<NodeJS.Timeout>();
	const cameraRef: LegacyRef<CameraView> | undefined = useRef(null);
	const animatedValue = useRef(new Animated.Value(0)).current;
	const slideAnimation = useRef(
		new Animated.Value(Dimensions.get("window").height),
	).current;
	const isManualClosing = useRef(false);
	const rotationAnimation = useRef(new Animated.Value(0)).current;

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
				onCloseCamera();
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

	useEffect(() => {
		if (isCameraReady) {
			setTimeout(
				() => {
					Animated.timing(slideAnimation, {
						toValue: 0,
						useNativeDriver: true,
						duration: 300,
						easing: Easing.out(Easing.ease),
					}).start();
				},
				Platform.OS === "android" ? 400 : 0,
			);
		}
	}, [isCameraReady, slideAnimation]);

	useEffect(() => {
		let rotationDegree = 0;
		switch (orientation) {
			case "portrait":
				rotationDegree = 0;
				break;
			case "portraitUpsideDown":
				rotationDegree = 180;
				break;
			case "landscapeLeft":
				rotationDegree = 90;
				break;
			case "landscapeRight":
				rotationDegree = -90;
				break;
		}

		Animated.timing(rotationAnimation, {
			toValue: rotationDegree,
			duration: 150,
			useNativeDriver: true,
			easing: Easing.ease,
		}).start();
	}, [orientation, rotationAnimation]);

	const borderRadius = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [30, 12],
	});
	const scale = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [1, 0.6],
	});

	const onCloseCamera = () => {
		isManualClosing.current = true;
		Animated.timing(slideAnimation, {
			toValue: Dimensions.get("window").height,
			useNativeDriver: true,
			duration: 200,
			easing: Easing.in(Easing.ease),
		}).start(() => {
			onClose();
		});
	};

	if (!hasPermissions) {
		requestPermissions();
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

	const rotationStyle = {
		transform: [
			{
				rotate: rotationAnimation.interpolate({
					inputRange: [-90, 0, 90, 180],
					outputRange: ["-90deg", "0deg", "90deg", "180deg"],
				}),
			},
		],
	};

	const showFlash =
		cameraFacing === "back" &&
		((Platform.OS === "android" && !isRecording) || Platform.OS === "ios");

	return (
		<Animated.View
			style={[
				styles.cameraContainer,
				{
					transform: [{ translateY: slideAnimation }],
				},
			]}
		>
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.header}>
					<View style={styles.headerSpacer} />
					<Animated.View style={[styles.timerContainer, rotationStyle]}>
						<Text style={[styles.timerText, styles.timerTextLandscape]}>
							{Math.floor(recordingTime / 60)}:
							{(recordingTime % 60).toString().padStart(2, "0")}
						</Text>
					</Animated.View>
					<CloseButton onClose={onCloseCamera} rotationStyle={rotationStyle} />
				</View>

				<CameraView
					style={styles.camera}
					facing={cameraFacing}
					ref={cameraRef}
					responsiveOrientationWhenOrientationLocked={true}
					mode="video"
					flash={flash ? "on" : "off"}
					enableTorch={flash}
					onMountError={(error) => {
						console.log("error", error);
					}}
					onCameraReady={() => {
						setIsCameraReady(true);
					}}
					onResponsiveOrientationChanged={(orientation) => {
						setOrientation(orientation.orientation);
					}}
				/>

				<View style={styles.controls}>
					<FlashButton
						flash={flash}
						showFlash={showFlash}
						onToggleFlash={toggleFlash}
						rotationStyle={rotationStyle}
					/>
					<RecordButton
						onToggleRecording={toggleRecording}
						borderRadius={borderRadius}
						scale={scale}
					/>
					<FlipCameraButton
						isRecording={isRecording}
						onToggleCameraFacing={toggleCameraFacing}
						rotationStyle={rotationStyle}
					/>
				</View>
			</SafeAreaView>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "black",
	},
	cameraContainer: {
		flex: 1,
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
	controls: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 14,
		paddingTop: 20,
	},
	timerContainer: {
		alignItems: "center",
		justifyContent: "center",
		minWidth: 80,
	},
	timerText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	timerTextLandscape: {
		fontSize: 14,
	},
});
