import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../../components/Text";
import { colors } from "../../../constants/colors";
import { Header } from "../../../components/Header";
import { ChatSingleInput } from "../../../components/ChatSingleInput";
import { ResponseDisplay } from "../../../components/ResponseDisplay";
import { useCallback, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { fetch as expoFetch } from "expo/fetch";
import { MessageList } from "../../../features/chat/components/MessageList";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { AI_AVATAR } from "../../chat/[chatId]";

export default function ChatWithLily() {
	const { chatId } = useLocalSearchParams();

	const messageListRef = useRef(null);
	const safeAreaInsets = useSafeAreaInsets();

	const { messages, error, handleInputChange, input, handleSubmit, status } =
		useChat({
			fetch: expoFetch as unknown as typeof globalThis.fetch,
			api: "http://localhost:8081/api/chat-with-lily",
			streamProtocol: "data",
			headers: {
				Accept: "text/event-stream",
			},
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
