import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import {
	ExpoSpeechRecognitionModule,
	getSupportedLocales,
	isRecognitionAvailable,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BouncyPressable } from "../../../components/BouncyPressable";
import { RoundButton } from "../../../components/RoundButton";
import { font } from "../../../constants/font";
import FormattedText from "../../../i18n/FormattedText";
import { useI18n } from "../../../i18n/i18n";
import { showAlert } from "../../../utils/alert";

const WINDOW_HEIGHT = Dimensions.get("window").height;

export type SupportedLanguage = "en-US" | "fr-FR";

export const startSpeechRecognition = async (preferredLocale?: string) => {
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

		let recognitionLang = "en-US"; // Default to English

		// If preferred locale is French, check if French recognition is available
		if (preferredLocale?.startsWith("fr")) {
			try {
				const supportedLocales = await getSupportedLocales();
				const allLocales = [
					...supportedLocales.locales,
					...supportedLocales.installedLocales,
				];

				// Check if French is available
				const hasFrench = allLocales.some((loc) => loc.startsWith("fr"));

				if (hasFrench) {
					recognitionLang = "fr-FR";
				}
			} catch (error) {
				// If getSupportedLocales fails, stick with English
				console.warn("Failed to check French language availability", error);
			}
		}

		// Start speech recognition with detected language
		ExpoSpeechRecognitionModule.start({
			lang: recognitionLang,
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

const SpeechRecognition = ({
	permissionError,
	onSpeechEnd,
	isClosing = false,
	onClose,
}: {
	permissionError: string | null;
	onSpeechEnd?: (transcript: string) => void;
	isClosing?: boolean;
	onClose?: () => void;
}) => {
	const [transcript, setTranscript] = useState("");
	const [isEnglishAvailable, setIsEnglishAvailable] = useState<boolean | null>(
		null,
	);
	const [isFrenchAvailable, setIsFrenchAvailable] = useState<boolean | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const { locale } = useI18n();
	const isPreferredLanguageFrench = locale.startsWith("fr");

	const isWeb = Platform.OS === "web";
	const safeAreaInsets = useSafeAreaInsets();

	// Add animated value for refresh button opacity
	const refreshButtonOpacity = useSharedValue(0);

	// Create animated style for the refresh button
	const refreshButtonStyle = useAnimatedStyle(() => {
		return {
			opacity: refreshButtonOpacity.value,
		};
	});

	// Update refresh button opacity when transcript changes
	useEffect(() => {
		if (transcript.length > 0) {
			refreshButtonOpacity.value = withTiming(1, { duration: 300 });
		} else {
			refreshButtonOpacity.value = withTiming(0, { duration: 300 });
		}
	}, [transcript, refreshButtonOpacity]);

	// Check if English and French are available
	useEffect(() => {
		const checkLanguageAvailability = async () => {
			// On web, just assume both languages are available
			if (isWeb) {
				setIsEnglishAvailable(true);
				setIsFrenchAvailable(true);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const recognitionAvailable = isRecognitionAvailable();
				if (!recognitionAvailable) {
					setIsEnglishAvailable(false);
					setIsFrenchAvailable(false);
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

					// Check if French is available
					const hasFrench = allLocales.some((locale) =>
						locale.startsWith("fr"),
					);
					setIsFrenchAvailable(hasFrench);
				} catch (error) {
					// If getSupportedLocales fails, assume English is available
					setIsEnglishAvailable(true);
					setIsFrenchAvailable(false);
				}
			} catch (error) {
				console.error("Failed to check language availability", error);
				setIsEnglishAvailable(false);
				setIsFrenchAvailable(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkLanguageAvailability();
	}, [isWeb]);

	// Determine the active language
	const getActiveLanguage = (): SupportedLanguage => {
		if (isPreferredLanguageFrench && isFrenchAvailable) {
			return "fr-FR";
		}
		return "en-US";
	};

	useSpeechRecognitionEvent("start", () => {
		console.log(">>> start");
	});

	useSpeechRecognitionEvent("end", () => {
		console.log(">>> end");
	});

	// Set up speech recognition event listeners
	useSpeechRecognitionEvent("result", (event) => {
		// Don't update transcript if we're closing
		if (isClosing) return;

		const newTranscript = event.results[0]?.transcript || "";
		setTranscript(newTranscript);
	});

	// Handle end event to show alert with final transcript and reset
	useSpeechRecognitionEvent("end", () => {
		// Skip handling if component is being deliberately closed
		if (isClosing) return;
		if (isRefreshing) {
			setTranscript("");
			setIsRefreshing(false);
			setTimeout(() => {
				// Start speech recognition with the active language
				ExpoSpeechRecognitionModule.start({
					lang: getActiveLanguage(),
					interimResults: true,
					continuous: true,
				});
			}, 100);
			return;
		}

		if (transcript) {
			// Call the onEnd callback with the final transcript
			if (onSpeechEnd) {
				onSpeechEnd(transcript);
			}
		}
	});

	// Clean up when the component unmounts
	useEffect(() => {
		return () => {
			ExpoSpeechRecognitionModule.abort();
		};
	}, []);

	useEffect(() => {
		if (isRefreshing) {
			ExpoSpeechRecognitionModule.abort();
		}
	}, [isRefreshing]);

	const handleMicrophonePress = () => {
		if (transcript.length === 0) {
			return;
		}
		ExpoSpeechRecognitionModule.stop();
	};
	const handleRefresh = () => setIsRefreshing(true);

	const renderContent = () => {
		// If there's a permission error, show it
		if (permissionError) {
			return <Text style={styles.errorText}>{permissionError}</Text>;
		}

		// If we're loading, show loading message
		if (isLoading) {
			return (
				<FormattedText
					style={styles.languageText}
					id="app.checking_language_availability"
				/>
			);
		}

		// If neither English nor French is available, show error message
		if (isEnglishAvailable === false && isFrenchAvailable === false) {
			return (
				<FormattedText
					style={styles.languageText}
					id="app.voice_recognition_not_availabl"
				/>
			);
		}
		// If there's a transcript, show it
		if (transcript) {
			return <Text style={styles.transcriptText}>{transcript}</Text>;
		}
		// Otherwise show "Listening..."
		return (
			<View style={styles.listeningContainer}>
				<FormattedText
					style={[styles.transcriptText, { opacity: 0.8, marginBottom: 10 }]}
					id="app.listening"
				/>

				<FormattedText
					style={styles.languageText}
					id={
						isPreferredLanguageFrench && isFrenchAvailable
							? "app.available_language_french"
							: "app.available_language_english"
					}
				/>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.transcriptContainer}>{renderContent()}</View>

			<View
				style={[
					styles.buttonsContainer,
					{ marginBottom: safeAreaInsets.bottom + 32 },
				]}
			>
				<BouncyPressable onPress={onClose}>
					<Ionicons name="close-outline" size={30} color="white" />
				</BouncyPressable>
				<RoundButton
					onPress={handleMicrophonePress}
					containerStyle={permissionError ? styles.disabledButton : {}}
					disabled={!!permissionError}
				>
					<SimpleLineIcons name="microphone" size={28} color="white" />
				</RoundButton>
				<Animated.View style={refreshButtonStyle}>
					<BouncyPressable onPress={handleRefresh}>
						<Ionicons name="refresh-outline" size={30} color="white" />
					</BouncyPressable>
				</Animated.View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: WINDOW_HEIGHT / 2,
	},
	transcriptContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 16,
	},
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "80%",
		alignSelf: "center",
		alignItems: "center",
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
	disabledButton: {
		opacity: 0.2,
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
