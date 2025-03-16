import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import {
	useDerivedValue,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { VolumeProgressBar } from "./components/VolumeProgressBar";
import { WaveMesh } from "./components/WaveMesh";

// Define volume constants with more dramatic range
const MIN_VOLUME = 0.2;
const MAX_VOLUME = 1.0; // Increase to maximum for more dramatic effect
const VOLUME_RANGE = MAX_VOLUME - MIN_VOLUME;

// Add volume amplification factor
const VOLUME_AMPLIFICATION = 1.5; // Amplify input volume for more dramatic changes

export const VoiceMode = () => {
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [isManualMode, setIsManualMode] = useState(true);
	const volume = useSharedValue(0);

	// Derive animated values for wave properties with MORE DRAMATIC progression
	const waveIntensity = useDerivedValue(() => {
		// Increase the range for more dramatic effect
		const minIntensity = 2;
		const maxIntensity = 45; // Increased from 30 for more dramatic waves

		// Apply non-linear mapping for more dramatic changes
		const amplifiedVolume = volume.value ** 1.5; // Apply exponential curve
		return minIntensity + (maxIntensity - minIntensity) * amplifiedVolume;
	});

	const waveSpeed = useDerivedValue(() => {
		// Increase speed range for more dramatic effect
		const minSpeed = 10000; // Slower base speed
		const maxSpeed = 50; // Even faster max speed

		// Apply non-linear mapping for more dramatic changes
		const amplifiedVolume = volume.value ** 1.3;
		return minSpeed - (minSpeed - maxSpeed) * amplifiedVolume;
	});

	const rotationSpeed = useDerivedValue(() => {
		const minSpeed = 150000; // Even slower base speed
		const maxSpeed = 500; // Even faster max speed

		// Apply more dramatic curve
		const amplifiedVolume = volume.value ** 1.4;
		return minSpeed - (minSpeed - maxSpeed) * amplifiedVolume;
	});

	// Properly handle recording lifecycle
	// biome-ignore lint/correctness/useExhaustiveDependencies: reanimated
	useEffect(() => {
		let isMounted = true;

		const setupRecording = async () => {
			try {
				// First, ensure any existing recording is stopped
				if (recording) {
					await recording.stopAndUnloadAsync();
					setRecording(null);
				}

				// Only start a new recording if we're not in manual mode
				if (!isManualMode) {
					await Audio.requestPermissionsAsync();
					await Audio.setAudioModeAsync({
						allowsRecordingIOS: true,
						playsInSilentModeIOS: true,
					});

					const newRecording = await Audio.Recording.createAsync(
						Audio.RecordingOptionsPresets.HIGH_QUALITY,
						(status) => {
							if (status.metering && isMounted && !isManualMode) {
								// Convert dB to a 0-1 scale with amplification
								let rawVolume = Math.min(
									Math.max((status.metering + 60) / 60, 0),
									1,
								);

								// Amplify the raw volume for more dramatic changes
								rawVolume = Math.min(rawVolume * VOLUME_AMPLIFICATION, 1);

								// Normalize to our defined range
								const normalizedVolume = MIN_VOLUME + rawVolume * VOLUME_RANGE;

								// Use more responsive spring for faster reactions
								volume.value = withSpring(normalizedVolume, {
									mass: 0.3, // Reduced mass for faster response
									damping: 9, // Less damping for more bounce
									stiffness: 120, // Increased stiffness for faster response
								});
							}
						},
						50, // Update more frequently (50ms instead of 100ms)
					);

					setRecording(newRecording.recording);
				} else {
					// In manual mode, we don't need a recording
					volume.value = withSpring(MIN_VOLUME, {
						mass: 0.5,
						damping: 12,
						stiffness: 100,
					});
				}
			} catch (err) {
				console.error("Failed to start recording", err);
			}
		};

		setupRecording();

		return () => {
			isMounted = false;
			// Clean up recording when component unmounts
			if (recording) {
				recording
					.stopAndUnloadAsync()
					.catch((err) => console.error("Error stopping recording", err));
			}
		};
	}, [isManualMode]); // Only re-run when isManualMode changes

	const setManualVolume = (value: number) => {
		// Make manual volume more dramatic too
		const normalizedVolume = MIN_VOLUME + (value / 10) * VOLUME_RANGE;

		volume.value = withSpring(normalizedVolume, {
			mass: 0.3,
			damping: 9,
			stiffness: 120,
		});
	};

	// Handle toggle of manual mode
	const handleManualModeToggle = (value: boolean) => {
		// First stop any existing recording
		if (recording) {
			recording
				.stopAndUnloadAsync()
				.then(() => {
					setRecording(null);
					// Then update the mode
					setIsManualMode(value);
				})
				.catch((err) => {
					console.error("Error stopping recording during toggle", err);
					// Still update the mode even if there was an error
					setIsManualMode(value);
				});
		} else {
			// No recording to stop, just update the mode
			setIsManualMode(value);
		}
	};

	return (
		<View style={styles.layout}>
			<WaveMesh
				waveIntensity={waveIntensity}
				waveSpeed={waveSpeed}
				rotationSpeed={rotationSpeed}
				shape="star" // You can change this to "circle", "cross", or "star"
			/>
			<View style={styles.overlay}>
				<View style={styles.controls}>
					<View style={styles.switchContainer}>
						<Text style={styles.switchLabel}>Manual Mode</Text>
						<Switch
							value={isManualMode}
							onValueChange={handleManualModeToggle}
							trackColor={{ false: "#666", true: "#FF00FF" }}
						/>
					</View>
					{isManualMode && (
						<View style={styles.buttonContainer}>
							{Array.from({ length: 10 }, (_, i) => {
								const buttonValue = i + 1;
								return (
									<Pressable
										key={`volume-${buttonValue}`}
										style={styles.button}
										onPress={() => setManualVolume(buttonValue)}
									>
										<Text style={styles.buttonText}>{buttonValue}</Text>
									</Pressable>
								);
							})}
						</View>
					)}
				</View>
				<VolumeProgressBar volume={volume} />
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
	controls: {
		alignItems: "center",
		gap: 10,
	},
	switchContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	switchLabel: {
		color: "white",
		fontSize: 16,
	},
	buttonContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
		paddingHorizontal: 20,
	},
	button: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: "rgba(255, 0, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 14,
	},
});
