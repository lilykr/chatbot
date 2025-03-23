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
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

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
				startSpeechRecognition();
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
				<RoundButton onPress={handleMicrophonePress}>
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
