import { useChat, experimental_useObject as useObject } from "@ai-sdk/react";
import { router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useRef } from "react";
import {
	type FlatList,
	InteractionManager,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { Header } from "../../../components/Header";
import { KeyboardAvoidingView } from "../../../components/KeyboardAvoidingView";
import { Text } from "../../../components/Text";
import { colors } from "../../../constants/colors";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { MessageList } from "../../../features/chat/components/MessageList";
import { useCamera } from "../../../features/chat/hooks/useCamera";
import { usePersistChat } from "../../../features/chat/hooks/usePersistChat";
import { type HistoryItem, storage } from "../../../services/storage";
import { titleSchema } from "../../api/generate-title+api";
import { apiUrl } from "../../../constants/apiUrl";

export const AI_AVATAR = require("../../../../assets/avatar.png");

// storage.clearAll();
storage.listen("history", (newValue) => {
	console.log("history changed", JSON.stringify(newValue, null, 2));
});

export default function Chat() {
	const { chatId } = useLocalSearchParams();
	const { showCamera, openCamera, handleCloseCamera } = useCamera();
	const safeAreaInsets = useSafeAreaInsets();
	const messageListRef = useRef<FlatList>(null);
	const inputRef = useRef<TextInput>(null);

	const initialChat = useRef(
		storage.get("history")?.find((chat) => chat.id === chatId) as
			| HistoryItem<"chat">
			| undefined,
	).current;

	const { messages, error, handleInputChange, input, handleSubmit, status } =
		useChat({
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
			setTimeout(() => {
				InteractionManager.runAfterInteractions(() => {
					inputRef.current?.focus();
				});
			}, 560);
		}
	}, [chatId]);

	usePersistChat({
		chatId: chatId as string,
		messages,
		status,
		initialChat,
		isGeneratingTitle,
		title: titleObject?.title,
		type: "chat",
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
			<Header title={titleObject?.title || "AI chatbot"} type="chat" />
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
				/>
			</KeyboardAvoidingView>

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
