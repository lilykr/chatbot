import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { font } from "../../../constants/font";

export const startSpeechRecognition = async () => {
	try {
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

		// Start speech recognition
		ExpoSpeechRecognitionModule.start({
			lang: "en-US",
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
