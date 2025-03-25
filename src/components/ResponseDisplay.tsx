import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import type {
	TextToSpeechInput,
	TextToSpeechOutput,
} from "../app/api/text-to-speech+api";
import { apiUrl } from "../constants/apiUrl";
import { colors } from "../constants/colors";
import { secureFetch } from "../services/securityFront";
import { ActionButtons } from "./ActionButtons";
import { GradientButton } from "./GradientButton";
import { RoundButton } from "./RoundButton";
import { SkiaLoader } from "./SkiaLoader";

interface ResponseDisplayProps {
	content?: string | undefined;
	isLoading: boolean;
	onNewResponse: () => void;
	loadingText?: string;
	newResponseButtonText?: string;
}

export function ResponseDisplay({
	content,
	isLoading,
	onNewResponse,
	loadingText = "AI is starting the rant...",
	newResponseButtonText = "New Rant",
}: ResponseDisplayProps) {
	const scrollViewRef = useRef<ScrollView>(null);
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoadingAudio, setIsLoadingAudio] = useState(false);

	useEffect(() => {
		if (content) {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 500,
				useNativeDriver: true,
			}).start();
		} else {
			fadeAnim.setValue(0);
		}
	}, [content, fadeAnim]);

	useEffect(() => {
		return sound
			? () => {
					sound.unloadAsync();
				}
			: undefined;
	}, [sound]);

	const handleTextToSpeech = async () => {
		if (!content) return;

		if (sound && isPlaying) {
			// Pause the sound
			await sound.pauseAsync();
			setIsPlaying(false);
			return;
		}

		if (sound) {
			// Resume the sound
			await sound.playAsync();
			setIsPlaying(true);
			return;
		}

		// Start new text-to-speech
		setIsLoadingAudio(true);
		try {
			const response = await secureFetch(`${apiUrl}/api/text-to-speech`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: content } as TextToSpeechInput),
			});

			const { presignedUrl } = (await response.json()) as TextToSpeechOutput;

			const { sound: newSound } = await Audio.Sound.createAsync(
				{ uri: presignedUrl },
				{ shouldPlay: true },
			);

			setSound(newSound);
			setIsPlaying(true);

			newSound.setOnPlaybackStatusUpdate((status) => {
				if (status.isLoaded) {
					if (status.didJustFinish) {
						setIsPlaying(false);
					}
				}
			});
		} catch (error) {
			console.error("Failed to play text-to-speech:", error);
		} finally {
			setIsLoadingAudio(false);
		}
	};

	return (
		<View style={styles.responseContainer}>
			<ScrollView
				ref={scrollViewRef}
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={true}
			>
				<Animated.Text style={[styles.responseText, { opacity: fadeAnim }]}>
					{content}
				</Animated.Text>
				{content && !isLoading && (
					<View style={styles.actionButtonsContainer}>
						<ActionButtons content={content} />
					</View>
				)}
				<View style={styles.loadingContainer}>
					{isLoading && !content && <SkiaLoader size={100} />}
				</View>
			</ScrollView>
			{content && (
				<View style={styles.audioButtonContainer}>
					<RoundButton onPress={handleTextToSpeech} size={48}>
						{isLoadingAudio ? (
							<SkiaLoader size={24} />
						) : (
							<Ionicons
								name={isPlaying ? "pause-outline" : "volume-high-outline"}
								size={24}
								color="white"
							/>
						)}
					</RoundButton>
				</View>
			)}
			<View style={styles.newResponseButtonContainer}>
				<GradientButton onPress={onNewResponse} text={newResponseButtonText} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	responseContainer: {
		width: "100%",
		flex: 1,
		paddingTop: 56,
	},
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		height: 120,
		width: 120,
		alignSelf: "center",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContent: {
		flexGrow: 1,
	},
	responseText: {
		color: colors.white,
		fontSize: 24,
		lineHeight: 46,
		marginBottom: 20,
		marginTop: 30,
		paddingHorizontal: 20,
	},
	actionButtonsContainer: {
		paddingHorizontal: 20,
	},
	newResponseButtonContainer: {
		paddingHorizontal: 20,
	},
	typingIndicator: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	typingText: {
		color: colors.lightGrey,
		marginLeft: 10,
		fontSize: 14,
	},
	audioButtonContainer: {
		paddingTop: 16,
		paddingBottom: 16,
	},
});
