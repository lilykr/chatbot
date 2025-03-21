import { useChat, experimental_useObject as useObject } from "@ai-sdk/react";
import type { LegendListRef } from "@legendapp/list";
import { router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, type TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { Header } from "../../../components/Header";
import { Text } from "../../../components/Text";
import { colors } from "../../../constants/colors";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { MessageList } from "../../../features/chat/components/MessageList";
import { useCamera } from "../../../features/chat/hooks/useCamera";
import { type HistoryItem, storage } from "../../../services/storage";
import { titleSchema } from "../../api/generate-title+api";

const AI_AVATAR = require("../../../../assets/avatar.png");

// storage.clearAll();
storage.addOnValueChangedListener((key) => {
	console.log("history changed", key);
});

storage.listen("history", (newValue) => {
	console.log("history changed", JSON.stringify(newValue, null, 2));
});

export default function Chat() {
	const { chatId } = useLocalSearchParams();

	console.log("chatId", chatId);
	const { showCamera, openCamera, handleCloseCamera } = useCamera();
	const safeAreaInsets = useSafeAreaInsets();
	const messageListRef = useRef<LegendListRef>(null);
	const inputRef = useRef<TextInput>(null);

	const initialChat = useRef(
		storage.get("history")?.find((chat) => chat.id === chatId) as
			| HistoryItem<"chat">
			| undefined,
	).current;

	const { messages, error, handleInputChange, input, handleSubmit, status } =
		useChat({
			fetch: expoFetch as unknown as typeof globalThis.fetch,
			api: "https://lilykr-chatbot.expo.app/api/chat",
			streamProtocol: "data",
			headers: {
				Accept: "text/event-stream",
			},
			initialMessages: initialChat?.value.messages ?? [],
		});

	const { object: titleObject, submit: generateTitle } = useObject({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		api: "https://lilykr-chatbot.expo.app/api/generate-title",
		schema: titleSchema,
		headers: {
			Accept: "text/event-stream",
		},
		// initialValue: { title: initialChat?.value.title },
	});

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (chatId === "new") {
			router.setParams({ chatId: uuid.v4() });
		}
	}, [chatId]);

	useEffect(() => {
		// Only save if the last message is from the assistant
		if (messages.length === 0) return;
		if (status === "streaming") return;
		if (messages[messages.length - 1]?.role !== "assistant") return;

		const history = storage.get("history") ?? [];

		if (initialChat) {
			const newChat: HistoryItem = {
				...initialChat,
				value: {
					...initialChat.value,
					messages,
				},
			};
			storage.set("history", (prev) => [...(prev ?? []), newChat]);
		}
		if (!initialChat) {
			storage.set("history", [
				...history,
				{
					id: chatId as string,
					type: "chat",
					value: { title: titleObject?.title ?? "New chat", messages },
					createdAt: Date.now(),
					updatedAt: Date.now(),
				},
			]);
		}
	}, [initialChat, status, messages, titleObject?.title, chatId]);

	const handleLayout = useCallback(() => {
		SplashScreen.hideAsync();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleSubmitInput = useCallback(() => {
		if (input.trim().length === 0) return;
		handleSubmit();
		if (messages.length === 0) {
			generateTitle({ messages: [{ role: "user", content: input }] });
		}
	}, [input, handleSubmit, messages]);

	// Function to handle video capture
	// const onVideoCaptured = useCallback((videoUri: string) => {
	// 	// handleVideoMessage(videoUri);
	// }, []);

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
			<Header title={titleObject?.title || "AI chatbot"} />
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
