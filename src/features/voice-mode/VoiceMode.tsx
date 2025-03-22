import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Header } from "../../components/Header";
import { DebugVolume } from "./components/DebugVolume";
import SpeechRecognition, {
	startSpeechRecognition,
	stopSpeechRecognition,
} from "./components/SpeechRecognition";
import { VoiceControlButtons } from "./components/VoiceControlButtons";
import { WaveMesh } from "./components/WaveMesh";
import { useVolumeControl } from "./hooks/useVolumeControl";

const WINDOW_HEIGHT = Dimensions.get("window").height;
// Add this constant at the top with other constants
const enableDebug = false; // You can toggle this to show/hide debug controls
const FINAL_POINT_COUNT = 1000; // Target number of points
const INITIAL_POINT_COUNT = 200; // Starting with fewer points for fast initial render

export type VoiceModeProps = {
	onSpeechEnd: (transcript: string) => void;
	onClose: () => void;
	autoStart?: boolean;
};

export function VoiceMode({
	onSpeechEnd,
	onClose,
	autoStart = false,
}: VoiceModeProps) {
	// Create the shared values in the component
	const volume = useSharedValue(0);
	const opacity = useSharedValue(0);
	const pointCount = useSharedValue(INITIAL_POINT_COUNT);
	const renderedOnce = useRef(false);
	const [isSpeechActive, setIsSpeechActive] = useState(autoStart);
	const [isClosing, setIsClosing] = useState(false);

	// Track the actual point count as a state value for passing to WaveMesh
	const [currentPointCount, setCurrentPointCount] =
		useState(INITIAL_POINT_COUNT);

	// Derive animated values for wave properties with MORE DRAMATIC progression
	const waveIntensity = useDerivedValue(() => {
		// Increase the range for more dramatic effect
		const minIntensity = 5; // Increased from 2 for more baseline movement
		const maxIntensity = 45; // Increased from 30 for more dramatic waves

		// More responsive at lower volumes using square root instead of power
		const amplifiedVolume = Math.sqrt(volume.value);
		return minIntensity + (maxIntensity - minIntensity) * amplifiedVolume;
	}, []);

	const waveSpeed = useDerivedValue(() => {
		// Increase speed range for more dramatic effect
		const minSpeed = 10000; // Slower base speed
		const maxSpeed = 50; // Even faster max speed

		// More responsive at lower volumes
		const amplifiedVolume = Math.sqrt(volume.value);
		return minSpeed - (minSpeed - maxSpeed) * amplifiedVolume;
	}, []);

	const rotationSpeed = useDerivedValue(() => {
		const minSpeed = 150000; // Even slower base speed
		const maxSpeed = 1000; // Even faster max speed

		// More responsive at lower volumes
		const amplifiedVolume = Math.sqrt(volume.value);
		return minSpeed - (minSpeed - maxSpeed) * amplifiedVolume;
	}, []);

	// Update currentPointCount when the shared value changes
	useEffect(() => {
		const updatePointCount = () => {
			setCurrentPointCount(Math.round(pointCount.value));
		};

		const interval = setInterval(updatePointCount, 16);
		return () => clearInterval(interval);
	}, [pointCount]);

	// Pass the volume shared value to the hook
	const {
		isManualMode,
		permissionError,
		toggleManualMode,
		setPermissionErrorState,
		handleManualVolumeChange,
		cleanup: volumeControlCleanup,
	} = useVolumeControl({ volume });

	// Handle speech recognition end
	const handleSpeechEnd = (transcript: string) => {
		// Don't send the transcript if we're deliberately closing
		if (isClosing) {
			return;
		}

		if (onSpeechEnd) {
			onSpeechEnd(transcript);
		}
	};

	// Handle toggle of speech recognition
	const handleToggleSpeechRecognition = async () => {
		if (isSpeechActive) {
			// Make sure to stop speech recognition and clean up
			stopSpeechRecognition();
			onClose();
			setIsSpeechActive(false);
		} else {
			// First, ensure we've cleaned up any previous recording
			volumeControlCleanup();

			try {
				const started = await startSpeechRecognition();
				if (!started) {
					setPermissionErrorState("Failed to start speech recognition");
				} else {
					setIsSpeechActive(true);
					setPermissionErrorState(null);
					// If successful, ensure manual mode is off
					toggleManualMode(false);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				setPermissionErrorState(errorMessage);
				setIsSpeechActive(false);
			}
		}
	};

	// Handle refresh button press to reset transcript
	const handleRefresh = useCallback(() => {
		// Set a refreshing flag to prevent new transcripts from being processed
		setIsClosing(true);

		// Stop the current speech recognition session
		if (isSpeechActive) {
			stopSpeechRecognition();
		}

		// Clean up any recording resources
		volumeControlCleanup();

		// Short delay to ensure everything is cleaned up
		setTimeout(() => {
			// Reset the closing flag
			setIsClosing(false);

			// Clear the transcript by calling onSpeechEnd with empty string
			if (onSpeechEnd) {
				onSpeechEnd("");
			}

			// If speech was active before, restart it
			if (isSpeechActive) {
				const restartSpeechRecognition = async () => {
					// Ensure we've cleaned up any previous recording
					volumeControlCleanup();

					try {
						const started = await startSpeechRecognition();
						if (!started) {
							setPermissionErrorState("Failed to restart speech recognition");
							setIsSpeechActive(false);
						} else {
							setPermissionErrorState(null);
							// If successful, ensure manual mode is off
							toggleManualMode(false);
						}
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : String(error);
						setPermissionErrorState(errorMessage);
						setIsSpeechActive(false);
					}
				};

				restartSpeechRecognition();
			}
		}, 300); // longer delay to ensure clean restart
	}, [
		onSpeechEnd,
		isSpeechActive,
		volumeControlCleanup,
		toggleManualMode,
		setPermissionErrorState,
	]);

	// Handle close button press
	const handleClose = useCallback(() => {
		// Set the closing flag to prevent sending the transcript
		setIsClosing(true);

		// Ensure all recording and audio resources are cleaned up
		if (isSpeechActive) {
			stopSpeechRecognition();
		}
		volumeControlCleanup();

		if (onClose) {
			onClose();
		}
	}, [onClose, isSpeechActive, volumeControlCleanup]);

	// Handle first render completion
	const handleFirstRender = useCallback(() => {
		if (renderedOnce.current) return;
		renderedOnce.current = true;

		// Increase the point count gradually
		const increasePoints = () => {
			// Gradually increase point count
			pointCount.value = withTiming(FINAL_POINT_COUNT, { duration: 1000 });

			// Start fading in once we've begun increasing points
			opacity.value = withTiming(1, { duration: 1200 });
		};

		// Start increasing points after a short delay
		setTimeout(increasePoints, 100);

		// Log for debugging
		console.log("Loading complete, starting animation");
	}, [opacity, pointCount]);

	// Create animated style for opacity
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
			flex: 1, // Ensure WaveMesh container takes full space
		};
	});

	// Handle when component mounts
	useEffect(() => {
		console.log("VoiceMode component mounted");
		// After a small delay for the initial render with minimal points
		const timer = setTimeout(handleFirstRender, 200);

		// Start recording automatically if autoStart is true
		if (autoStart) {
			const autoStartRecording = async () => {
				// Ensure we've cleaned up any previous recording
				volumeControlCleanup();

				try {
					const started = await startSpeechRecognition();
					if (!started) {
						setPermissionErrorState("Failed to start speech recognition");
						setIsSpeechActive(false);
					} else {
						setIsSpeechActive(true);
						setPermissionErrorState(null);
						// If successful, ensure manual mode is off
						toggleManualMode(false);
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : String(error);
					setPermissionErrorState(errorMessage);
					setIsSpeechActive(false);
				}
			};

			// Wait a bit longer to ensure everything is ready
			setTimeout(autoStartRecording, 500);
		}

		return () => {
			clearTimeout(timer);
			// Make sure to stop speech recognition when unmounting
			if (isSpeechActive) {
				stopSpeechRecognition();
			}
			// Always clean up recording and audio when unmounting
			volumeControlCleanup();
			// Reset closing flag when unmounting
			setIsClosing(false);
		};
	}, [
		handleFirstRender,
		autoStart,
		toggleManualMode,
		setPermissionErrorState,
		isSpeechActive,
		volumeControlCleanup,
	]);

	return (
		<View style={styles.layout}>
			<Header title="AI Voice mode" type="voice" />
			{/* WaveMesh with opacity animation */}
			<Animated.View style={[animatedStyle, styles.waveMeshContainer]}>
				<WaveMesh
					waveIntensity={waveIntensity}
					waveSpeed={waveSpeed}
					rotationSpeed={rotationSpeed}
					pointCount={currentPointCount}
					color="#FF00FF"
				/>
			</Animated.View>

			<SpeechRecognition
				isActive={isSpeechActive}
				permissionError={permissionError}
				onEnd={handleSpeechEnd}
				isClosing={isClosing}
			/>
			<VoiceControlButtons
				onPress={handleToggleSpeechRecognition}
				onClose={handleClose}
				onRefresh={handleRefresh}
			/>
			<View style={styles.overlay}>
				{enableDebug && (
					<DebugVolume
						volume={volume}
						isManualMode={isManualMode}
						onManualModeToggle={toggleManualMode}
						onVolumeChange={handleManualVolumeChange}
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: "black",
	},
	overlay: {
		position: "absolute",
		bottom: 40,
		left: 0,
		right: 0,
		alignItems: "center",
		gap: 20,
	},
	loadingContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 10,
	},
	waveMeshContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: WINDOW_HEIGHT / 3,
		zIndex: 1,
		// borderWidth: 1,
		// borderColor: "blue",
	},
});
