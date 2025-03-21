import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";
import { Header } from "../../../components/Header";

import { useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { fetch as expoFetch } from "expo/fetch";
import { MessageList } from "../../../features/chat/components/MessageList";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { AI_AVATAR } from "../../chat/[chatId]";
import { KeyboardAvoidingView } from "../../../components/KeyboardAvoidingView";
import { type type type type type type type HistoryItem, storage } from "../../../services/storage";

export default function ChatWithLily() {
	const { chatId } = useLocalSearchParams();

  const initialChat = useRef(
		storage.get("history")?.find((chat) => chat.id === chatId) as
			| HistoryItem<"chat">
			| undefined,
	).current;


	const messageListRef = useRef(null);
	const safeAreaInsets = useSafeAreaInsets();

	const { messages, error, handleInputChange, input, handleSubmit, status } =
		useChat({
			fetch: expoFetch as unknown as typeof globalThis.fetch,
			api: "https://lilykr-chatbot.expo.app/api/chat-with-lily",
			streamProtocol: "data",
			headers: {
				Accept: "text/event-stream",
			},
      initialMessages: initialChat?.value.messages ?? [],

		});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleSubmitInput = useCallback(async () => {
		if (input.trim().length === 0) return;
		handleSubmit();
	}, [input]);

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
			<Header title={"Lisa-Lou's chatbot"} />
			<KeyboardAvoidingView keyboardOpenedOffset={-safeAreaInsets.bottom}>
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
