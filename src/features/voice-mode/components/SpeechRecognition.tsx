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
	// Stop speech recognition
	ExpoSpeechRecognitionModule.stop();
	// The callback will be called by the component via the onEnd prop
};

const SpeechRecognition = ({
	isRecognizing,
	onEnd,
}: {
	isRecognizing: boolean;
	onEnd?: (transcript: string) => void;
}) => {
	const [transcript, setTranscript] = useState("");
	const [isEnglishAvailable, setIsEnglishAvailable] = useState<boolean | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const isWeb = Platform.OS === "web";
	const [previousRecognizingState, setPreviousRecognizingState] =
		useState(false);

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
		if (isRecognizing && transcript) {
			// Call the onEnd callback with the final transcript
			if (onEnd) {
				onEnd(transcript);
			}

			// Reset transcript when recognition ends
			setTranscript("");
		}
	});

	// Track changes in isRecognizing to detect when user stops recognition
	useEffect(() => {
		// If we were recognizing before and now we're not, and we have a transcript
		if (previousRecognizingState && !isRecognizing && transcript) {
			// Show alert with the transcript
			showAlert("Transcription Complete", transcript, [{ text: "OK" }]);

			// Call the onEnd callback with the final transcript
			if (onEnd) {
				onEnd(transcript);
			}

			// Reset transcript
			setTranscript("");
		}

		// If we weren't recognizing before and now we are, reset transcript
		if (!previousRecognizingState && isRecognizing) {
			setTranscript("");
		}

		// Update previous state
		setPreviousRecognizingState(isRecognizing);
	}, [isRecognizing, previousRecognizingState, transcript, onEnd]);

	// Clean up when the component unmounts
	useEffect(() => {
		return () => {
			ExpoSpeechRecognitionModule.abort();
		};
	}, []);

	const renderContent = () => {
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
		if (isRecognizing) {
			// If there's a transcript, show it
			if (transcript) {
				return <Text style={styles.transcriptText}>{transcript}</Text>;
			}
			// Otherwise show "Listening..."
			return (
				<Text style={styles.transcriptText}>
					<Text style={{ opacity: 0.8 }}>Listening...</Text>
				</Text>
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
	languageText: {
		color: "white",
		fontSize: 14,
		opacity: 0.8,
		fontFamily: font.regular,
		textAlign: "center",
	},
});

export default SpeechRecognition;
