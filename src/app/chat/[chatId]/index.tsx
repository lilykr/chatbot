import { useChat, experimental_useObject as useObject } from "@ai-sdk/react";
import type { LegendListRef } from "@legendapp/list";
import { router, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useRef } from "react";
import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { Header } from "../../../components/Header";
import { Text } from "../../../components/Text";
import { colors } from "../../../constants/colors";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { MessageList } from "../../../features/chat/components/MessageList";
import { useCamera } from "../../../features/chat/hooks/useCamera";
import { usePersistChat } from "../../../features/chat/hooks/usePersistChat";
import { type HistoryItem, storage } from "../../../services/storage";
import { titleSchema } from "../../api/generate-title+api";

const AI_AVATAR = require("../../../../assets/avatar.png");

storage.listen("history", (newValue) => {
	console.log("history changed", JSON.stringify(newValue, null, 2));
});

export default function Chat() {
	const { chatId } = useLocalSearchParams();

	const { showCamera, openCamera, handleCloseCamera } = useCamera();
	const safeAreaInsets = useSafeAreaInsets();
	const messageListRef = useRef<LegendListRef>(null);

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
		initialValue: { title: initialChat?.value.title },
	});

	useEffect(() => {
		if (chatId === "new") {
			router.setParams({ chatId: uuid.v4() });
		}
	}, [chatId]);

	useEffect(() => {
		setTimeout(() => {
			messageListRef.current?.scrollToEnd();
		}, 100);
	}, []);

	usePersistChat({
		chatId: chatId as string,
		messages,
		status,
		initialChat,
		title: titleObject?.title,
	});

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
			<Header title={titleObject?.title || "AI chatbot"} />
			<KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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
