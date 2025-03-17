import { StyleSheet, View } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { IconButton } from "../../components/IconButton";
import { DebugVolume } from "./components/DebugVolume";
import SpeechRecognition, {
	startSpeechRecognition,
	stopSpeechRecognition,
} from "./components/SpeechRecognition";
import { WaveMesh } from "./components/WaveMesh";
import { useVolumeControl } from "./hooks/useVolumeControl";

// Add this constant at the top with other constants
const enableDebug = true; // You can toggle this to show/hide debug controls

export const VoiceMode = () => {
	// Create the shared values in the component
	const volume = useSharedValue(0);

	// Derive animated values for wave properties with MORE DRAMATIC progression
	const waveIntensity = useDerivedValue(() => {
		// Increase the range for more dramatic effect
		const minIntensity = 2;
		const maxIntensity = 45; // Increased from 30 for more dramatic waves

		// Apply non-linear mapping for more dramatic changes
		const amplifiedVolume = volume.value ** 1.5; // Apply exponential curve
		return minIntensity + (maxIntensity - minIntensity) * amplifiedVolume;
	}, []);

	const waveSpeed = useDerivedValue(() => {
		// Increase speed range for more dramatic effect
		const minSpeed = 10000; // Slower base speed
		const maxSpeed = 50; // Even faster max speed

		// Apply non-linear mapping for more dramatic changes
		const amplifiedVolume = volume.value ** 1.3;
		return minSpeed - (minSpeed - maxSpeed) * amplifiedVolume;
	}, []);

	const rotationSpeed = useDerivedValue(() => {
		const minSpeed = 150000; // Even slower base speed
		const maxSpeed = 500; // Even faster max speed

		// Apply more dramatic curve
		const amplifiedVolume = volume.value ** 1.4;
		return minSpeed - (minSpeed - maxSpeed) * amplifiedVolume;
	}, []);

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
		console.log("Speech recognition ended with transcript:", transcript);
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

	return (
		<View style={styles.layout}>
			<WaveMesh
				waveIntensity={waveIntensity}
				waveSpeed={waveSpeed}
				rotationSpeed={rotationSpeed}
			/>
			<SpeechRecognition
				isRecognizing={isRecognizing}
				onEnd={handleSpeechEnd}
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
				<IconButton onPress={handleToggleSpeechRecognition} />
			</View>
		</View>
	);
};

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
});
