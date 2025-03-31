import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { type SharedValue, runOnJS, withSpring } from "react-native-reanimated";

// Define volume constants with more dramatic range
const MIN_VOLUME = 0.2;
const MAX_VOLUME = 1.0; // Increase to maximum for more dramatic effect
const VOLUME_RANGE = MAX_VOLUME - MIN_VOLUME;

// Add volume amplification factor - increase for web
const MOBILE_VOLUME_AMPLIFICATION = 1.5; // Amplify input volume for mobile
const WEB_VOLUME_AMPLIFICATION = 3.5; // Higher amplification for web audio

// Web audio tends to have lower input levels, so we'll add a base boost
const WEB_VOLUME_BASE_BOOST = 0.07; // Add this to web audio before amplification

interface UseVolumeControlProps {
	volume: SharedValue<number>;
}

// Define AudioContext for TypeScript
interface WebAudioContextType {
	AudioContext: typeof AudioContext;
	webkitAudioContext?: typeof AudioContext;
}

export const useVolumeControl = ({ volume }: UseVolumeControlProps) => {
	const [recording, setRecording] = useState<Audio.Recording | null>(null);
	const [permissionError, setPermissionError] = useState<string | null>(null);
	const isMountedRef = useRef(true);
	const isRecordingSetupInProgressRef = useRef(false);
	const volumeRef = useRef(volume);
	const isRecordingUnloadingRef = useRef(false);

	// Web Audio API refs
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const webAudioAnimationFrameRef = useRef<number | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);

	// Keep volumeRef updated
	useEffect(() => {
		volumeRef.current = volume;
	}, [volume]);

	// Safe way to update volume without triggering Reanimated warnings
	const updateVolumeValue = useCallback((newValue: number) => {
		if (volumeRef.current) {
			volumeRef.current.value = withSpring(newValue, {
				mass: 0.3,
				damping: 9,
				stiffness: 120,
			});
		}
	}, []);

	// Safely stop and unload recording
	const stopAndUnloadRecording = useCallback(
		async (rec: Audio.Recording | null) => {
			if (!rec || isRecordingUnloadingRef.current) return;

			try {
				isRecordingUnloadingRef.current = true;

				// Check recording status first
				const status = await rec.getStatusAsync();

				// Only try to stop if it's not already stopped
				if (status.canRecord) {
					await rec.stopAndUnloadAsync();
				}

				if (isMountedRef.current) {
					setRecording(null);
				}
			} catch (err) {
				// Ignore "already unloaded" errors, log others
				if (
					!(err instanceof Error) ||
					!err.message.includes("already been unloaded")
				) {
					console.error("Error stopping recording:", err);
				}
			} finally {
				isRecordingUnloadingRef.current = false;
			}
		},
		[],
	);

	// Setup Web Audio API for volume detection
	const setupWebAudio = useCallback(async () => {
		// Clean up any existing web audio setup
		cleanupWebAudio();

		if (isMountedRef.current) {
			try {
				// Create audio context
				const windowWithAudio = window as unknown as WebAudioContextType;
				const AudioContextClass =
					windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
				if (!AudioContextClass) {
					console.error("Web Audio API is not supported in this browser");
					return;
				}

				audioContextRef.current = new AudioContextClass();
				analyserRef.current = audioContextRef.current.createAnalyser();

				// Configure analyser - use smaller FFT size for more responsive volume detection
				analyserRef.current.fftSize = 128; // Smaller FFT size (was 256)
				analyserRef.current.smoothingTimeConstant = 0.5; // Less smoothing for more responsive changes (was 0.8)

				// Request microphone access
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				mediaStreamRef.current = stream;

				// Connect microphone to analyser
				const source = audioContextRef.current.createMediaStreamSource(stream);
				source.connect(analyserRef.current);

				// Create data array for frequency data
				if (analyserRef.current) {
					const frequencyBinCount = analyserRef.current.frequencyBinCount;
					dataArrayRef.current = new Uint8Array(frequencyBinCount);
				}

				// Start monitoring volume
				startVolumeMonitoring();
			} catch (err) {
				console.error("Error setting up Web Audio API:", err);
			}
		}
	}, []);

	// Clean up Web Audio resources
	const cleanupWebAudio = useCallback(() => {
		// Cancel animation frame if running
		if (webAudioAnimationFrameRef.current !== null) {
			cancelAnimationFrame(webAudioAnimationFrameRef.current);
			webAudioAnimationFrameRef.current = null;
		}

		// Stop all tracks in the media stream
		if (mediaStreamRef.current) {
			const tracks = mediaStreamRef.current.getTracks();
			for (const track of tracks) {
				track.stop();
			}
			mediaStreamRef.current = null;
		}

		// Close audio context
		if (audioContextRef.current) {
			if (audioContextRef.current.state !== "closed") {
				try {
					audioContextRef.current.close();
				} catch (err) {
					console.error("Error closing AudioContext:", err);
				}
			}
			audioContextRef.current = null;
			analyserRef.current = null;
		}

		// Clear data array
		dataArrayRef.current = null;
	}, []);

	// Monitor volume using Web Audio API
	const startVolumeMonitoring = useCallback(() => {
		// Only check for manual mode, allow volume detection during speech recognition
		if (!analyserRef.current || !isMountedRef.current) return;

		const updateVolume = () => {
			// Check if we should stop monitoring (only if manual mode or component unmounted)
			if (!analyserRef.current || !isMountedRef.current) {
				if (webAudioAnimationFrameRef.current !== null) {
					cancelAnimationFrame(webAudioAnimationFrameRef.current);
					webAudioAnimationFrameRef.current = null;
				}
				return;
			}

			// Get volume data - ensure analyser and dataArray are available
			const currentAnalyser = analyserRef.current;
			const dataArray = dataArrayRef.current;

			if (!currentAnalyser || !dataArray) return;

			// Get frequency data
			currentAnalyser.getByteFrequencyData(dataArray);

			// Calculate average volume (0-255)
			let sum = 0;
			const length = dataArray.length;

			// Safe access to dataArray elements
			for (let i = 0; i < length; i++) {
				// TypeScript doesn't know that we've already checked dataArray is not null
				// Use a type assertion to tell TypeScript this is safe
				sum += dataArray[i] ?? 0; // Use nullish coalescing to handle undefined values
			}

			const average = sum / length;

			// Convert to 0-1 range and apply amplification with base boost for web
			let rawVolume = average / 255;

			// Add base boost to increase the minimum volume level on web
			rawVolume = Math.min(rawVolume + WEB_VOLUME_BASE_BOOST, 1);

			// Apply higher amplification for web
			rawVolume = Math.min(rawVolume * WEB_VOLUME_AMPLIFICATION, 1);

			// Apply non-linear curve to emphasize changes (exponential curve)
			rawVolume = rawVolume ** 0.7; // Values less than 1 emphasize changes in lower volumes

			// Normalize to our defined range
			const normalizedVolume = MIN_VOLUME + rawVolume * VOLUME_RANGE;

			// Update volume with spring animation using runOnJS to avoid Reanimated warnings
			runOnJS(updateVolumeValue)(normalizedVolume);

			// Continue monitoring
			webAudioAnimationFrameRef.current = requestAnimationFrame(updateVolume);
		};

		// Start monitoring loop
		webAudioAnimationFrameRef.current = requestAnimationFrame(updateVolume);
	}, [updateVolumeValue]);

	// Properly handle recording lifecycle
	// biome-ignore lint/correctness/useExhaustiveDependencies: Complex dependencies handled with refs
	useEffect(() => {
		isMountedRef.current = true;

		const setupRecording = async () => {
			// Prevent multiple simultaneous setup attempts
			if (isRecordingSetupInProgressRef.current) return;
			isRecordingSetupInProgressRef.current = true;

			try {
				// First, ensure any existing recording is stopped
				if (recording) {
					await stopAndUnloadRecording(recording);
				}

				// Only start a new recording if we're not in manual mode
				if (isMountedRef.current) {
					// Set minimum volume while we set up
					updateVolumeValue(MIN_VOLUME);

					if (Platform.OS === "web") {
						// Use Web Audio API for web
						await setupWebAudio();
					} else {
						// Use Expo Audio for native platforms
						await Audio.requestPermissionsAsync();
						await Audio.setAudioModeAsync({
							allowsRecordingIOS: true,
							playsInSilentModeIOS: true,
						});

						// Check if component is still mounted before creating a new recording
						if (!isMountedRef.current) return;

						const newRecording = await Audio.Recording.createAsync(
							Audio.RecordingOptionsPresets.HIGH_QUALITY,
							(status) => {
								// Continue volume detection even during speech recognition
								if (status.metering && isMountedRef.current) {
									// Convert dB to a 0-1 scale with amplification
									let rawVolume = Math.min(
										Math.max((status.metering + 60) / 60, 0),
										1,
									);

									// Amplify the raw volume for more dramatic changes
									rawVolume = Math.min(
										rawVolume * MOBILE_VOLUME_AMPLIFICATION,
										1,
									);

									// Normalize to our defined range
									const normalizedVolume =
										MIN_VOLUME + rawVolume * VOLUME_RANGE;

									// Use runOnJS to update the volume safely
									runOnJS(updateVolumeValue)(normalizedVolume);
								}
							},
							50, // Update more frequently (50ms instead of 100ms)
						);

						if (isMountedRef.current) {
							setRecording(newRecording.recording);
						} else {
							// If component unmounted during setup, clean up the recording
							await stopAndUnloadRecording(newRecording.recording);
						}
					}
				} else if (isMountedRef.current) {
					// In manual mode, set to minimum volume
					updateVolumeValue(MIN_VOLUME);
				}
			} catch (err) {
				console.error("Failed to start recording", err);
			} finally {
				isRecordingSetupInProgressRef.current = false;
			}
		};

		setupRecording();

		return () => {
			isMountedRef.current = false;

			// Clean up recording when component unmounts or dependencies change
			if (Platform.OS === "web") {
				cleanupWebAudio();
			} else if (recording) {
				stopAndUnloadRecording(recording).catch((err) =>
					console.error("Error in cleanup:", err),
				);
			}
		};
	}, [
		stopAndUnloadRecording,
		cleanupWebAudio,
		setupWebAudio,
		updateVolumeValue,
	]);

	// Handle manual volume changes
	const handleManualVolumeChange = useCallback(
		(level: number) => {
			// Map the level (1-10) to our volume range
			const normalizedVolume = MIN_VOLUME + (level / 10) * VOLUME_RANGE;
			updateVolumeValue(normalizedVolume);
		},
		[updateVolumeValue],
	);

	// Handle permission errors
	const setPermissionErrorState = useCallback(
		(error: string | null) => {
			setPermissionError(error);

			if (error && recording) {
				stopAndUnloadRecording(recording).catch((err) =>
					console.error("Error stopping recording on error:", err),
				);
			}
		},
		[recording, stopAndUnloadRecording],
	);

	// Add explicit cleanup function to be called when voice mode is closed
	const cleanup = useCallback(() => {
		// Clean up recording
		if (recording) {
			stopAndUnloadRecording(recording).catch((err) =>
				console.error("Error in cleanup:", err),
			);
		}

		// Clean up Web Audio if on web
		if (Platform.OS === "web") {
			cleanupWebAudio();
		}
	}, [recording, stopAndUnloadRecording, cleanupWebAudio]);

	return {
		permissionError,
		setPermissionErrorState,
		handleManualVolumeChange,
		cleanup,
	};
};
