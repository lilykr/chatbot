import {
	ExpoSpeechRecognitionModule,
	getSupportedLocales,
	isRecognitionAvailable,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { font } from "../../../constants/font";

export type SupportedLanguage = "en-US";

export const startSpeechRecognition = async () => {
	try {
		// Check if speech recognition is available
		const recognitionAvailable = isRecognitionAvailable();
		if (!recognitionAvailable) {
			Alert.alert(
				"Speech Recognition Error",
				"Speech recognition is not available on this device.",
				[{ text: "OK" }],
			);
			return false;
		}

		const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
		if (!result.granted) {
			console.warn("Speech recognition permissions not granted", result);
			Alert.alert(
				"Permission Error",
				"Speech recognition permissions were not granted. Please enable microphone access in your device settings.",
				[{ text: "OK" }],
			);
			return false;
		}

		// Always use English
		const lang: SupportedLanguage = "en-US";

		// Start speech recognition
		ExpoSpeechRecognitionModule.start({
			lang,
			interimResults: true,
			continuous: true,
		});

		return true;
	} catch (error) {
		console.error("Failed to start speech recognition", error);
		Alert.alert(
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

	// Check if English is available (skip on web)
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
					return;
				}

				// Try to get supported locales
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
					// This happens on older Android versions
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

	// Handle end event to show alert with final transcript
	useSpeechRecognitionEvent("end", () => {
		if (isRecognizing && transcript) {
			Alert.alert("Transcription Complete", transcript, [{ text: "OK" }]);

			// Call the onEnd callback with the final transcript
			if (onEnd) {
				onEnd(transcript);
			}
		}
	});

	// Clean up when the component unmounts
	useEffect(() => {
		return () => {
			ExpoSpeechRecognitionModule.abort();
		};
	}, []);

	// Expose the current transcript to parent components
	useEffect(() => {
		if (!isRecognizing && transcript && onEnd) {
			onEnd(transcript);
		}
	}, [isRecognizing, transcript, onEnd]);

	const renderLanguageInfo = () => {
		// Don't show language info on web or when transcription has started
		if (isWeb || transcript) {
			return null;
		}

		if (isLoading) {
			return (
				<Text style={styles.languageText}>
					Checking language availability...
				</Text>
			);
		}

		if (isEnglishAvailable === false) {
			return (
				<Text style={styles.languageText}>
					Voice recognition not available on this device
				</Text>
			);
		}

		if (isEnglishAvailable === true) {
			return (
				<Text style={styles.languageText}>Available language: English</Text>
			);
		}

		return null;
	};

	return (
		<View style={styles.transcriptContainer}>
			<Text style={styles.transcriptText}>
				{transcript || <Text style={{ opacity: 0.8 }}>Listening...</Text>}
			</Text>
			{renderLanguageInfo()}
		</View>
	);
};

const styles = StyleSheet.create({
	transcriptContainer: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
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
		marginTop: 10,
		opacity: 0.8,
		fontFamily: font.regular,
	},
});

export default SpeechRecognition;
