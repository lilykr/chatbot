import { router, useLocalSearchParams } from "expo-router";
import { type FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { Header } from "../../../components/Header";
import { colors } from "../../../constants/colors";

import { useChat, experimental_useObject as useObject } from "@ai-sdk/react";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useRef } from "react";
import { KeyboardAvoidingView } from "../../../components/KeyboardAvoidingView";
import { apiUrl } from "../../../constants/apiUrl";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { MessageList } from "../../../features/chat/components/MessageList";
import { usePersistChat } from "../../../features/chat/hooks/usePersistChat";
import { type HistoryItem, storage } from "../../../services/storage";
import { titleSchema } from "../../api/generate-title+api";

export const LLK_AVATAR = require("../../../../assets/llk.png");

export default function ChatWithLily() {
	const { chatId } = useLocalSearchParams();

	const initialChat = useRef(
		storage.get("history")?.find((chat) => chat.id === chatId) as
			| HistoryItem<"chatWithLily">
			| undefined,
	).current;

	const messageListRef = useRef<FlatList>(null);
	const safeAreaInsets = useSafeAreaInsets();

	const { messages, error, handleInputChange, input, handleSubmit, status } =
		useChat({
			fetch: expoFetch as unknown as typeof globalThis.fetch,
			api: `${apiUrl}/api/chat-with-lily`,
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
		isGeneratingTitle,
		title: titleObject?.title,
		type: "chatWithLily",
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleSubmitInput = useCallback(async () => {
		if (input.trim().length === 0) return;
		handleSubmit();
		if (messages.length === 0) {
			generateTitle({ messages: [{ role: "user", content: input }] });
		}
	}, [input, messages, generateTitle]);

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: safeAreaInsets.top,
					paddingBottom: safeAreaInsets.bottom,
				},
			]}
		>
			<Header
				title={titleObject?.title ?? "Lisa-Lou's chatbot"}
				type="chatWithLily"
			/>
			<KeyboardAvoidingView keyboardOpenedOffset={-safeAreaInsets.bottom}>
				<MessageList
					users={[{ _id: 1 }, { _id: 2, avatar: LLK_AVATAR }]}
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
				/>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
