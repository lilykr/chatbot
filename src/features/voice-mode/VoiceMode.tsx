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

export const VoiceMode = () => {
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [isManualMode, setIsManualMode] = useState(true);
	const volume = useSharedValue(0);

	// Derive animated values for wave properties with LINEAR progression
	const waveIntensity = useDerivedValue(() => {
		// Use linear interpolation instead of exponential
		const minIntensity = 2;
		const maxIntensity = 30; // Slightly reduced max to avoid extreme values

		// Simple linear interpolation
		return minIntensity + (maxIntensity - minIntensity) * volume.value;
	});

	const waveSpeed = useDerivedValue(() => {
		// Linear interpolation for wave speed
		const minSpeed = 8000; // Slower base speed
		const maxSpeed = 1000; // Faster max speed

		// Linear mapping of volume to speed
		return minSpeed - (minSpeed - maxSpeed) * volume.value;
	});

	const rotationSpeed = useDerivedValue(() => {
		const minSpeed = 100000; // Much slower base speed (100 seconds per rotation)
		const maxSpeed = 10000; // Less extreme max speed (10 seconds per rotation)

		// Linear mapping with adjusted curve to make middle values more impactful
		// This gives a slight curve while avoiding the dramatic exponential effect
		const linearFactor = volume.value;
		const adjustedFactor = linearFactor * (1.3 - 0.3 * linearFactor); // Subtle curve adjustment

		return minSpeed - (minSpeed - maxSpeed) * adjustedFactor;
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		let isMounted = true;

		const startRecording = async () => {
			try {
				await Audio.requestPermissionsAsync();
				await Audio.setAudioModeAsync({
					allowsRecordingIOS: true,
					playsInSilentModeIOS: true,
				});

				const newRecording = await Audio.Recording.createAsync(
					Audio.RecordingOptionsPresets.HIGH_QUALITY,
					(status) => {
						if (status.metering && isMounted && !isManualMode) {
							// Convert dB to a 0-1 scale and animate smoothly
							const normalizedVolume = Math.min(
								Math.max((status.metering + 60) / 60, 0),
								1,
							);
							volume.value = withSpring(normalizedVolume, {
								mass: 0.5,
								damping: 12,
								stiffness: 100,
							});
						}
					},
					100, // Update every 100ms
				);

				setRecording(newRecording.recording);
			} catch (err) {
				console.error("Failed to start recording", err);
			}
		};

		startRecording();

		return () => {
			isMounted = false;
			if (recording) {
				recording.stopAndUnloadAsync();
			}
		};
	}, [isManualMode]);

	const setManualVolume = (value: number) => {
		volume.value = withSpring(value / 10, {
			mass: 0.5,
			damping: 12,
			stiffness: 100,
		});
	};

	return (
		<View style={styles.layout}>
			<WaveMesh
				waveIntensity={waveIntensity}
				waveSpeed={waveSpeed}
				rotationSpeed={rotationSpeed}
			/>
			<View style={styles.overlay}>
				<View style={styles.controls}>
					<View style={styles.switchContainer}>
						<Text style={styles.switchLabel}>Manual Mode</Text>
						<Switch
							value={isManualMode}
							onValueChange={setIsManualMode}
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
