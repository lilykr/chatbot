import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { font } from "../../../constants/font";

// Create a module-level variable for volume that can be accessed by other components
let currentVolumeLevel = 0;

// Create a callback that components can use to get the current volume
export const getVolumeLevel = () => currentVolumeLevel;

export const startSpeechRecognition = async () => {
	try {
		const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
		if (!result.granted) {
			console.warn("Speech recognition permissions not granted", result);
			return false;
		}

		// Start speech recognition
		ExpoSpeechRecognitionModule.start({
			lang: "en-US",
			interimResults: true,
			continuous: true,
			volumeChangeEventOptions: {
				enabled: true,
				intervalMillis: 50, // More frequent updates for smoother animation
			},
		});

		return true;
	} catch (error) {
		console.error("Failed to start speech recognition", error);
		return false;
	}
};

export const stopSpeechRecognition = (
	onTranscriptComplete?: (transcript: string) => void,
) => {
	ExpoSpeechRecognitionModule.stop();

	// The final transcript will be handled in the component via the event listeners
	// The callback allows the parent component to access the final transcript
};

const SpeechRecognition = ({
	isRecognizing,
	onVolumeChange,
}: {
	isRecognizing: boolean;
	onVolumeChange?: (volume: number) => void;
}) => {
	const [transcript, setTranscript] = useState("");

	// Set up speech recognition event listeners
	useSpeechRecognitionEvent("result", (event) => {
		const newTranscript = event.results[0]?.transcript || "";
		setTranscript(newTranscript);
	});

	useSpeechRecognitionEvent("volumechange", (event) => {
		// Map the volume value (-2 to 10) to a 0-1 scale for the wave animation
		// Anything below 0 is essentially inaudible
		const normalizedVolume = Math.max(0, event.value) / 10;
		currentVolumeLevel = normalizedVolume;

		// Call the callback if provided
		if (onVolumeChange) {
			onVolumeChange(normalizedVolume);
		}
	});

	// Handle end event to show alert with final transcript
	useSpeechRecognitionEvent("end", () => {
		if (isRecognizing && transcript) {
			Alert.alert("Transcription Complete", transcript, [{ text: "OK" }]);
		}
	});

	// Clean up when the component unmounts
	useEffect(() => {
		return () => {
			ExpoSpeechRecognitionModule.abort();
		};
	}, []);

	return (
		<View style={styles.transcriptContainer}>
			<Text style={styles.transcriptText}>{transcript || "Listening..."}</Text>
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
});

export default SpeechRecognition;
