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
		isRecognizing,
		toggleManualMode,
		setRecognizingState,
		handleManualVolumeChange,
	} = useVolumeControl({ volume });

	// Handle speech recognition end
	const handleSpeechEnd = (transcript: string) => {
		if (onSpeechEnd) {
			onSpeechEnd(transcript);
		}
	};

	// Handle toggle of speech recognition
	const handleToggleSpeechRecognition = async () => {
		if (isRecognizing) {
			stopSpeechRecognition();
			setRecognizingState(false);
		} else {
			const started = await startSpeechRecognition();
			setRecognizingState(started);
		}
	};

	// Handle refresh button press to reset transcript
	const handleRefresh = useCallback(() => {
		if (onSpeechEnd) {
			onSpeechEnd("");
		}
	}, [onSpeechEnd]);

	// Handle close button press
	const handleClose = useCallback(() => {
		if (onClose) {
			onClose();
		}
	}, [onClose]);

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
				const started = await startSpeechRecognition();
				setRecognizingState(started);
			};

			// Wait a bit longer to ensure everything is ready
			setTimeout(autoStartRecording, 500);
		}

		return () => clearTimeout(timer);
	}, [handleFirstRender, autoStart, setRecognizingState]);

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
				isRecognizing={isRecognizing}
				onEnd={handleSpeechEnd}
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
