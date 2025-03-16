import { Audio } from "expo-av";
import { useCallback, useEffect, useState } from "react";
import { type SharedValue, withSpring } from "react-native-reanimated";

// Define volume constants with more dramatic range
const MIN_VOLUME = 0.2;
const MAX_VOLUME = 1.0; // Increase to maximum for more dramatic effect
const VOLUME_RANGE = MAX_VOLUME - MIN_VOLUME;

// Add volume amplification factor
const VOLUME_AMPLIFICATION = 1.5; // Amplify input volume for more dramatic changes

interface UseVolumeControlProps {
	volume: SharedValue<number>;
}

export const useVolumeControl = ({ volume }: UseVolumeControlProps) => {
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [isManualMode, setIsManualMode] = useState(true);
	const [isRecognizing, setIsRecognizing] = useState(false);
	const [currentVolume, setCurrentVolume] = useState(0);

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
	}, [isManualMode, volume]); // Added volume to dependencies

	// Handle volume changes from speech recognition
	const handleVolumeChange = useCallback((newVolume: number) => {
		setCurrentVolume(newVolume);
	}, []);

	// Update the volume based on speech recognition
	useEffect(() => {
		if (isRecognizing) {
			// Map the currentVolume (0-1) to our volume range
			const normalizedVolume = MIN_VOLUME + currentVolume * VOLUME_RANGE;

			// Use more responsive spring for faster reactions
			volume.value = withSpring(normalizedVolume, {
				mass: 0.3, // Reduced mass for faster response
				damping: 9, // Less damping for more bounce
				stiffness: 120, // Increased stiffness for faster response
			});
		} else {
			// When not recognizing, set to minimum volume
			volume.value = withSpring(MIN_VOLUME, {
				mass: 0.5,
				damping: 12,
				stiffness: 100,
			});
		}
	}, [currentVolume, isRecognizing, volume]);

	// Toggle speech recognition state
	const setRecognizingState = (recognizing: boolean) => {
		setIsRecognizing(recognizing);
	};

	return {
		isRecognizing,
		setRecognizingState,
		handleVolumeChange,
	};
};
