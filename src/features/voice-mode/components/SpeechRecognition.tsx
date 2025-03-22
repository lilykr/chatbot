import {
	ExpoSpeechRecognitionModule,
	getSupportedLocales,
	isRecognitionAvailable,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { font } from "../../../constants/font";
import { showAlert } from "../../../utils/alert";

const WINDOW_HEIGHT = Dimensions.get("window").height;

export type SupportedLanguage = "en-US";

export const startSpeechRecognition = async () => {
	try {
		// Check if speech recognition is available
		const recognitionAvailable = isRecognitionAvailable();
		if (!recognitionAvailable) {
			showAlert(
				"Speech Recognition Error",
				"Speech recognition is not available on this device.",
				[{ text: "OK" }],
			);
			return false;
		}

		const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
		if (!result.granted) {
			console.warn("Speech recognition permissions not granted", result);
			showAlert(
				"Permission Error",
				"Speech recognition permissions were not granted. Please enable microphone access in your device settings.",
				[{ text: "OK" }],
			);
			return false;
		}

		// Start speech recognition with English
		ExpoSpeechRecognitionModule.start({
			lang: "en-US",
			interimResults: true,
			continuous: true,
		});

		return true;
	} catch (error) {
		console.error("Failed to start speech recognition", error);
		showAlert(
			"Speech Recognition Error",
			`Failed to start speech recognition: ${error instanceof Error ? error.message : String(error)}`,
			[{ text: "OK" }],
		);
		return false;
	}
};

export const stopSpeechRecognition = (
	onTranscriptComplete?: (transcript: string) => void,
) => {
	try {
		// First try to abort any existing speech recognition
		ExpoSpeechRecognitionModule.abort();

		// Then explicitly stop it
		ExpoSpeechRecognitionModule.stop();

		// The callback will be called by the component via the onEnd prop
		console.log("Speech recognition stopped");
	} catch (error) {
		// If there's an error, log it but don't throw to avoid crashing
		console.error("Error stopping speech recognition:", error);
	}
};

const SpeechRecognition = ({
	isActive,
	permissionError,
	onEnd,
}: {
	isActive: boolean;
	permissionError: string | null;
	onEnd?: (transcript: string) => void;
}) => {
	const [transcript, setTranscript] = useState("");
	const [isEnglishAvailable, setIsEnglishAvailable] = useState<boolean | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const isWeb = Platform.OS === "web";
	const [previousActiveState, setPreviousActiveState] = useState(false);

	// Check if English is available
	useEffect(() => {
		const checkEnglishAvailability = async () => {
			// On web, just assume English is available
			if (isWeb) {
				setIsEnglishAvailable(true);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const recognitionAvailable = isRecognitionAvailable();
				if (!recognitionAvailable) {
					setIsEnglishAvailable(false);
					setIsLoading(false);
					return;
				}

				try {
					const supportedLocales = await getSupportedLocales();
					const allLocales = [
						...supportedLocales.locales,
						...supportedLocales.installedLocales,
					];

					// Check if English is available
					const hasEnglish = allLocales.some((locale) =>
						locale.startsWith("en"),
					);
					setIsEnglishAvailable(hasEnglish);
				} catch (error) {
					// If getSupportedLocales fails, assume English is available
					setIsEnglishAvailable(true);
				}
			} catch (error) {
				console.error("Failed to check language availability", error);
				setIsEnglishAvailable(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkEnglishAvailability();
	}, [isWeb]);

	// Set up speech recognition event listeners
	useSpeechRecognitionEvent("result", (event) => {
		const newTranscript = event.results[0]?.transcript || "";
		setTranscript(newTranscript);
	});

	// Handle end event to show alert with final transcript and reset
	useSpeechRecognitionEvent("end", () => {
		if (isActive && transcript) {
			// Call the onEnd callback with the final transcript
			if (onEnd) {
				onEnd(transcript);
			}

			// Reset transcript when recognition ends
			setTranscript("");
		}
	});

	// Track changes in isActive to detect when user stops recognition
	useEffect(() => {
		// If we were active before and now we're not, and we have a transcript
		if (previousActiveState && !isActive && transcript) {
			// Call the onEnd callback with the final transcript
			if (onEnd) {
				onEnd(transcript);
			}

			// Reset transcript
			setTranscript("");
		}

		// If we weren't active before and now we are, reset transcript
		if (!previousActiveState && isActive) {
			setTranscript("");
		}

		// Update previous state
		setPreviousActiveState(isActive);
	}, [isActive, previousActiveState, transcript, onEnd]);

	// Clean up when the component unmounts
	useEffect(() => {
		return () => {
			try {
				// First abort any ongoing speech recognition
				ExpoSpeechRecognitionModule.abort();

				// Then explicitly stop it
				ExpoSpeechRecognitionModule.stop();

				console.log("Speech recognition cleanup on unmount");
			} catch (error) {
				console.error("Error in speech recognition cleanup:", error);
			}
		};
	}, []);

	const renderContent = () => {
		// If there's a permission error, show it
		if (permissionError) {
			return <Text style={styles.errorText}>{permissionError}</Text>;
		}

		// If we're loading, show loading message
		if (isLoading) {
			return (
				<Text style={styles.languageText}>
					Checking language availability...
				</Text>
			);
		}

		// If English is not available, show error message
		if (isEnglishAvailable === false) {
			return (
				<Text style={styles.languageText}>
					Voice recognition not available on this device
				</Text>
			);
		}

		// If recognition is active
		if (isActive) {
			// If there's a transcript, show it
			if (transcript) {
				return <Text style={styles.transcriptText}>{transcript}</Text>;
			}
			// Otherwise show "Listening..."
			return (
				<View style={styles.listeningContainer}>
					<Text
						style={[styles.transcriptText, { opacity: 0.8, marginBottom: 10 }]}
					>
						Listening...
					</Text>
					<Text style={styles.languageText}>Available language: English</Text>
				</View>
			);
		}

		// Default state: show available language
		return <Text style={styles.languageText}>Available language: English</Text>;
	};

	return <View style={styles.transcriptContainer}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
	transcriptContainer: {
		marginTop: WINDOW_HEIGHT / 2,
		flex: 1,

		alignItems: "center",
		justifyContent: "center",
	},
	transcriptText: {
		color: "white",
		fontSize: 22,
		lineHeight: 28,
		textAlign: "center",
		fontFamily: font.medium,
	},
	listeningContainer: {
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
	languageText: {
		color: "white",
		fontSize: 14,
		opacity: 0.8,
		fontFamily: font.regular,
		textAlign: "center",
	},
	errorText: {
		color: "#FF6B6B", // Red error color
		fontSize: 16,
		textAlign: "center",
		fontFamily: font.medium,
		padding: 10,
	},
});

export default SpeechRecognition;
