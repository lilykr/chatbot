import { useChat } from "@ai-sdk/react";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { type FlatList, StyleSheet, type TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { Header } from "../components/Header";
import { KeyboardAvoidingView } from "../components/KeyboardAvoidingView";
import { apiUrl } from "../constants/apiUrl";
import { ComposerInput } from "../features/chat/components/ComposerInput";
import { MessageList } from "../features/chat/components/MessageList";
import { usePersistChat } from "../features/chat/hooks/usePersistChat";
import { secureFetch } from "../services/api"; // Import our secure fetch
import { syncServerTime } from "../services/security";

export default function SecureChatExample() {
	const { chatId } = useLocalSearchParams<{ chatId: string | "new" }>();
	const safeAreaInsets = useSafeAreaInsets();
	const messageListRef = useRef<FlatList>(null);
	const inputRef = useRef<TextInput>(null);

	// Sync time with server when component mounts
	useEffect(() => {
		syncServerTime();
	}, []);

	const {
		messages,
		error,
		handleInputChange,
		input,
		handleSubmit,
		status,
		append,
	} = useChat({
		// Use our secure fetch wrapper
		fetch: secureFetch as unknown as typeof globalThis.fetch,
		api: `${apiUrl}/api/chat`,
		streamProtocol: "data",
		headers: {
			Accept: "text/event-stream",
			"Content-Type": "text/event-stream",
		},
	});

	useEffect(() => {
		if (chatId === "new") {
			router.setParams({ chatId: uuid.v4() as string });
		}
	}, [chatId]);

	usePersistChat({
		chatId: chatId as string,
		messages,
		status,
		type: "chat",
		initialChat: undefined,
		title: undefined,
		isGeneratingTitle: false,
	});

	const handleSubmitInput = useCallback(() => {
		if (input.trim().length === 0) return;
		handleSubmit();
	}, [input, handleSubmit]);

	if (error) {
		// Handle different error types
		if (error.message.includes("CLOCK_DRIFT")) {
			// Handle clock drift errors
			syncServerTime();
			return (
				<View style={styles.errorContainer}>
					<Header title="Clock Drift Detected" type="chat" />
					<View style={styles.errorMessage}>
						<ComposerInput
							value={input}
							onChangeText={(text) =>
								handleInputChange({
									target: { value: text },
								} as unknown as React.ChangeEvent<HTMLInputElement>)
							}
							onSubmit={handleSubmitInput}
							onCameraPress={() => {}}
							onVoicePress={() => {}}
						/>
					</View>
				</View>
			);
		}

		// Handle other error types
		return (
			<View style={styles.errorContainer}>
				<Header title="Error" type="chat" />
				<View style={styles.errorMessage}>
					<ComposerInput
						value={input}
						onChangeText={(text) =>
							handleInputChange({
								target: { value: text },
							} as unknown as React.ChangeEvent<HTMLInputElement>)
						}
						onSubmit={handleSubmitInput}
						onCameraPress={() => {}}
						onVoicePress={() => {}}
					/>
				</View>
			</View>
		);
	}

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
			<Header title="AI chatbot" type="chat" />
			<KeyboardAvoidingView>
				<MessageList
					users={[{ _id: 1 }, { _id: 2 }]}
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
					onCameraPress={() => {}}
					onVoicePress={() => {}}
				/>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	errorContainer: {
		flex: 1,
	},
	errorMessage: {
		flex: 1,
		justifyContent: "flex-end",
	},
});
