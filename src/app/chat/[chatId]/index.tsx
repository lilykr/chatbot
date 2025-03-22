import { useChat, experimental_useObject as useObject } from "@ai-sdk/react";
import { router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type FlatList,
	InteractionManager,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { Header } from "../../../components/Header";
import { KeyboardAvoidingView } from "../../../components/KeyboardAvoidingView";
import { Text } from "../../../components/Text";
import { apiUrl } from "../../../constants/apiUrl";
import { colors } from "../../../constants/colors";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { MessageList } from "../../../features/chat/components/MessageList";
import { useCamera } from "../../../features/chat/hooks/useCamera";
import { usePersistChat } from "../../../features/chat/hooks/usePersistChat";
import { VoiceMode } from "../../../features/voice-mode/VoiceMode";
import { type HistoryItem, storage } from "../../../services/storage";
import { titleSchema } from "../../api/generate-title+api";

export const AI_AVATAR = require("../../../../assets/avatar.png");

storage.clearAll();
storage.listen("history", (newValue) => {
	console.log("history changed", JSON.stringify(newValue, null, 2));
});

export default function Chat() {
	const { chatId, voiceModePrompt, openVoiceMode } = useLocalSearchParams<{
		chatId: string | "new";
		voiceModePrompt?: string;
		openVoiceMode?: "true" | "false";
	}>();
	const { showCamera, openCamera, handleCloseCamera } = useCamera();
	const safeAreaInsets = useSafeAreaInsets();
	const messageListRef = useRef<FlatList>(null);
	const inputRef = useRef<TextInput>(null);
	const hasAutoSentVoicePrompt = useRef(false);

	// Add state to handle voice mode visibility
	const [showVoiceMode, setShowVoiceMode] = useState(false);
	// Animation value for voice mode opacity
	const voiceModeOpacity = useSharedValue(0);

	const initialChat = useRef(
		storage.get("history")?.find((chat) => chat.id === chatId) as
			| HistoryItem<"chat">
			| undefined,
	).current;

	const {
		messages,
		error,
		handleInputChange,
		input,
		handleSubmit,
		status,
		append,
	} = useChat({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		api: `${apiUrl}/api/chat`,
		streamProtocol: "data",
		headers: {
			Accept: "text/event-stream",
		},
		initialMessages: initialChat?.value.messages ?? [],
	});

	const {
		object: titleObject,
		submit: generateTitle,
		isLoading: isGeneratingTitle,
	} = useObject({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		api: `${apiUrl}/api/generate-title`,
		schema: titleSchema,
		headers: {
			Accept: "text/event-stream",
		},
		initialValue: { title: initialChat?.value.title },
	});

	useEffect(() => {
		if (chatId === "new") {
			router.setParams({ chatId: uuid.v4() });
			if (!openVoiceMode) {
				setTimeout(() => {
					InteractionManager.runAfterInteractions(() => {
						inputRef.current?.focus();
					});
				}, 560);
			}
		}
	}, [chatId, openVoiceMode]);

	// Auto-send voiceMode prompt if provided and no existing messages
	useEffect(() => {
		if (
			voiceModePrompt &&
			messages.length === 0 &&
			status !== "streaming" &&
			!hasAutoSentVoicePrompt.current
		) {
			hasAutoSentVoicePrompt.current = true;

			handleInputChange({
				target: { value: voiceModePrompt },
			} as unknown as React.ChangeEvent<HTMLInputElement>);

			// Use requestAnimationFrame instead of setTimeout for better timing
			requestAnimationFrame(() => {
				handleSubmit();
				generateTitle({
					messages: [{ role: "user", content: voiceModePrompt }],
				});
			});
		}
	}, [
		voiceModePrompt,
		messages.length,
		status,
		handleInputChange,
		handleSubmit,
		generateTitle,
	]);

	usePersistChat({
		chatId: chatId as string,
		messages,
		status,
		initialChat,
		isGeneratingTitle,
		title: titleObject?.title,
		type: voiceModePrompt ? "voiceMode" : "chat",
	});

	const handleLayout = useCallback(() => {
		SplashScreen.hideAsync();
	}, []);

	const handleSubmitInput = useCallback(() => {
		if (input.trim().length === 0) return;
		handleSubmit();
		if (messages.length === 0) {
			generateTitle({ messages: [{ role: "user", content: input }] });
		}
	}, [input, handleSubmit, messages, generateTitle]);

	// Handle voice mode opening
	useEffect(() => {
		if (openVoiceMode === "true") {
			// Show voice mode with animation
			setShowVoiceMode(true);
			voiceModeOpacity.value = withTiming(1, { duration: 500 });
		}
	}, [openVoiceMode, voiceModeOpacity]);

	// Handle voice mode closing with animation
	const handleVoiceModeClose = useCallback(() => {
		voiceModeOpacity.value = withTiming(0, { duration: 500 }, () => {
			// This runs after animation completes
			runOnJS(setShowVoiceMode)(false);
		});
	}, [voiceModeOpacity]);

	// Handle speech end from voice mode
	const handleSpeechEnd = useCallback(
		(transcript: string) => {
			// Close voice mode with animation
			handleVoiceModeClose();

			// Process the transcript
			if (transcript) {
				// Directly append the message using the append function
				append({
					role: "user",
					content: transcript,
				});

				// Generate title if this is the first message
				if (messages.length === 0) {
					generateTitle({
						messages: [{ role: "user", content: transcript }],
					});
				}
			}
		},
		[append, generateTitle, messages.length, handleVoiceModeClose],
	);

	// Voice mode animated style
	const voiceModeAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: voiceModeOpacity.value,
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			zIndex: 100,
		};
	});

	// Function to open voice mode manually
	const openVoiceModeManually = useCallback(() => {
		setShowVoiceMode(true);
		voiceModeOpacity.value = withTiming(1, { duration: 500 });
	}, [voiceModeOpacity]);

	if (error) return <Text style={{ color: "white" }}>{error.message}</Text>;

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: safeAreaInsets.top,
					paddingBottom: safeAreaInsets.bottom,
				},
			]}
			onLayout={handleLayout}
		>
			<Header
				title={titleObject?.title || "AI chatbot"}
				type={openVoiceMode ? "voice" : "chat"}
			/>
			<KeyboardAvoidingView keyboardOpenedOffset={-safeAreaInsets.bottom}>
				<MessageList
					users={[{ _id: 1 }, { _id: 2, avatar: AI_AVATAR }]}
					messages={messages}
					listRef={messageListRef}
				/>
				<ComposerInput
					inputRef={inputRef}
					value={input}
					onChangeText={(text) =>
						handleInputChange({
							target: { value: text },
						} as unknown as React.ChangeEvent<HTMLInputElement>)
					}
					onSubmit={handleSubmitInput}
					onCameraPress={openCamera}
					onVoicePress={openVoiceModeManually}
				/>
			</KeyboardAvoidingView>

			{/* Add Voice Mode overlay */}
			{showVoiceMode && (
				<Animated.View style={voiceModeAnimatedStyle}>
					<VoiceMode
						onSpeechEnd={handleSpeechEnd}
						onClose={handleVoiceModeClose}
					/>
				</Animated.View>
			)}

			{/* {showCamera && (
				<View style={StyleSheet.absoluteFill}>
					<Camera
						onClose={handleCloseCamera}
						onVideoCaptured={onVideoCaptured}
					/>
				</View>
			)} */}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
});
