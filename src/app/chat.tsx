import { useChat } from "@ai-sdk/react";
import * as SplashScreen from "expo-splash-screen";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../components/Text";
import { colors } from "../constants/colors";
import { Camera } from "../features/camera/Camera";
import { ComposerInput } from "../features/chat/components/ComposerInput";
import {
	type Message,
	MessageList,
} from "../features/chat/components/MessageList";
import { AVATAR_USER } from "../features/chat/data/mockedMessages";
import { useCamera } from "../features/chat/hooks/useCamera";
import { useKeyboardHeight } from "../features/chat/hooks/useKeyboardHeight";

const AI_AVATAR = require("../../assets/avatar.png");

export default function Chat() {
	const {
		messages: aiMessages,
		error,
		handleInputChange,
		input,
		handleSubmit,
	} = useChat({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		api: "https://lilykr-chatbot.expo.app/api/chat",
		onError: (error) => console.error(error, "ERROR"),
		onResponse: (response) => console.log(response, "RESPONSE"),
		streamProtocol: "data",
		headers: {
			Accept: "text/event-stream",
		},
	});

	const { showCamera, openCamera, handleCloseCamera } = useCamera();
	const safeAreaInsets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();
	const messageListRef = useRef(null);

	const handleLayout = useCallback(() => {
		SplashScreen.hideAsync();
	}, []);

	// Convert AI messages to our message format
	const messages: Message[] = aiMessages.map((msg) => ({
		id: msg.id,
		content: msg.content,
		role: msg.role,
		createdAt: new Date(),
		userId: msg.role === "user" ? 1 : 2,
	}));

	const handleInputSubmit = useCallback(() => {
		if (input.trim().length === 0) return;
		handleSubmit();
	}, [input, handleSubmit]);

	// Function to handle video capture
	const onVideoCaptured = useCallback((videoUri: string) => {
		// handleVideoMessage(videoUri);
	}, []);

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
			<MessageList
				users={[{ _id: 1 }, { _id: 2, avatar: AI_AVATAR }]}
				messages={messages}
				listRef={messageListRef}
			/>

			<ComposerInput
				value={input}
				onChangeText={(text) =>
					handleInputChange({
						target: { value: text },
					} as unknown as React.ChangeEvent<HTMLInputElement>)
				}
				onSubmit={handleInputSubmit}
				onCameraPress={openCamera}
			/>

			{showCamera && (
				<View style={StyleSheet.absoluteFill}>
					<Camera
						onClose={handleCloseCamera}
						onVideoCaptured={onVideoCaptured}
					/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
});
