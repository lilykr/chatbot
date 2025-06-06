import { type CameraOrientation, CameraView } from "expo-camera";
import type React from "react";
import {
	type LegacyRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Animated,
	Dimensions,
	Easing,
	Platform,
	SafeAreaView,
	StyleSheet,
	View,
} from "react-native";
import FormattedText from "../../i18n/FormattedText";
import { CloseButton } from "./components/CloseButton";
import { FlashButton } from "./components/FlashButton";
import { FlipCameraButton } from "./components/FlipCameraButton";
import { RecordButton } from "./components/RecordButton";
import { useCameraPermissions } from "./hooks/useCameraPermissions";
import { useOrientationAnimation } from "./hooks/useOrientationAnimation";
import { useRecordingAnimation } from "./hooks/useRecordingAnimation";

interface CameraProps {
	onClose: () => void;
	onVideoCaptured: (videoUri: string) => void;
}

export const Camera: React.FC<CameraProps> = ({ onClose, onVideoCaptured }) => {
	const { hasPermissions, requestPermissions } = useCameraPermissions(onClose);
	const [isRecording, setIsRecording] = useState(false);
	const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back");
	const [flash, setFlash] = useState(false);
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [orientation, setOrientation] = useState<CameraOrientation | undefined>(
		undefined,
	);

	const cameraRef: LegacyRef<CameraView> | undefined = useRef(null);
	const slideAnimation = useRef(
		new Animated.Value(Dimensions.get("window").height),
	).current;
	const isManualClosing = useRef(false);

	const { borderRadius, scale } = useRecordingAnimation(isRecording);
	const rotationStyle = useOrientationAnimation(orientation);

	useEffect(() => {
		if (!cameraRef.current) return;

		if (isRecording) {
			cameraRef.current.recordAsync({ maxDuration: 30 }).then((url) => {
				if (isManualClosing.current) return;
				if (!url?.uri) {
					return alert("Error recording video");
				}
				onVideoCaptured(url.uri);
				onCloseCamera();
			});
		} else {
			cameraRef.current.stopRecording();
		}
	}, [isRecording, onVideoCaptured]);

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

	const onCloseCamera = useCallback(() => {
		isManualClosing.current = true;
		Animated.timing(slideAnimation, {
			toValue: Dimensions.get("window").height,
			useNativeDriver: true,
			duration: 200,
			easing: Easing.in(Easing.ease),
		}).start(() => {
			onClose();
		});
	}, [slideAnimation, onClose]);

	const toggleCameraFacing = useCallback(() => {
		setCameraFacing((prev) => {
			const newFacing = prev === "front" ? "back" : "front";
			if (newFacing === "front" && flash) {
				setFlash(false);
			}
			return newFacing;
		});
	}, [flash]);

	const onToggleFlash = useCallback(() => setFlash((prev) => !prev), []);

	const onToggleRecording = useCallback(
		() => setIsRecording((prev) => !prev),
		[],
	);

	const onMountError = useCallback(() => alert("Error mounting camera"), []);

	const onCameraReady = useCallback(() => setIsCameraReady(true), []);

	const onOrientationChanged = useCallback(
		(orientation: { orientation: CameraOrientation }) => {
			setOrientation(orientation.orientation);
		},
		[],
	);

	if (!hasPermissions) {
		requestPermissions();
		return null;
	}

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
						<FormattedText
							style={[styles.timerText, styles.timerTextLandscape]}
							id="app."
						/>
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
					onMountError={onMountError}
					onCameraReady={onCameraReady}
					onResponsiveOrientationChanged={onOrientationChanged}
				/>

				<View style={styles.controls}>
					<FlashButton
						flash={flash}
						showFlash={showFlash}
						onToggleFlash={onToggleFlash}
						rotationStyle={rotationStyle}
					/>

					<RecordButton
						onToggleRecording={onToggleRecording}
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
