import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Header } from "../../components/Header";
import { useI18n } from "../../i18n/i18n";
import { DebugVolume } from "./components/DebugVolume";
import SpeechRecognition, {
	checkLanguageAvailability,
	startSpeechRecognition,
} from "./components/SpeechRecognition";
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

export function VoiceMode({ onSpeechEnd, onClose }: VoiceModeProps) {
	const { t, locale } = useI18n();
	// Create the shared values in the component
	const volume = useSharedValue(0);
	const opacity = useSharedValue(0);
	const pointCount = useSharedValue(INITIAL_POINT_COUNT);
	const renderedOnce = useRef(false);
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

	// Handle close button press
	const handleClose = useCallback(() => {
		// Set the closing flag to prevent sending the transcript
		setIsClosing(true);

		volumeControlCleanup();

		if (onClose) {
			onClose();
		}
	}, [onClose, volumeControlCleanup]);

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
	}, [opacity, pointCount]);

	// Create animated style for opacity
	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
			flex: 1, // Ensure WaveMesh container takes full space
		};
	});

	// First, check language availability before starting speech recognition
	// biome-ignore lint/correctness/useExhaustiveDependencies: <intentionally ignoring dependencies to avoid re-running on every render>
	useEffect(() => {
		const checkLanguagesAndStart = async () => {
			try {
				// Check which languages are available
				const { isEnglishAvailable, isFrenchAvailable } =
					await checkLanguageAvailability();

				// Determine preferred language based on locale and availability
				const preferredLocale = locale;
				const isPreferredLanguageFrench = preferredLocale.startsWith("fr");

				// Only start if at least one language is available
				if (isEnglishAvailable || isFrenchAvailable) {
					// Start recording automatically
					await autoStartRecording(
						preferredLocale,
						isPreferredLanguageFrench && isFrenchAvailable,
					);
				} else {
					// If no language is available, set error state
					setPermissionErrorState(
						"Voice recognition is not available on this device",
					);
				}
			} catch (error) {
				console.error("Failed to check language availability", error);
				setPermissionErrorState("Failed to check language availability");
			}
		};

		// Start the process
		checkLanguagesAndStart();

		// After a small delay for the initial render with minimal points
		const timer = setTimeout(handleFirstRender, 200);

		return () => {
			clearTimeout(timer);
			// Always clean up recording and audio when unmounting
			volumeControlCleanup();
			// Reset closing flag when unmounting
			setIsClosing(false);
		};
	}, []);

	// Function to start speech recognition with the correct language
	const autoStartRecording = async (
		preferredLocale: string,
		usesFrench: boolean,
	) => {
		// Ensure we've cleaned up any previous recording
		volumeControlCleanup();

		try {
			// Pass the preferred locale to startSpeechRecognition
			const started = await startSpeechRecognition(preferredLocale);

			if (!started) {
				setPermissionErrorState(
					"Please allow speech recognition and microphone in settings",
				);
			} else {
				setPermissionErrorState(null);
				// If successful, ensure manual mode is off
				toggleManualMode(false);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setPermissionErrorState(errorMessage);
		}
	};

	return (
		<View style={styles.layout}>
			<Header title={t("app.ai_voice_mode")} type="voiceMode" />
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
				permissionError={permissionError}
				onSpeechEnd={handleSpeechEnd}
				isClosing={isClosing}
				onClose={handleClose}
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
	},
});
