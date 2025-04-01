import { router, useLocalSearchParams } from "expo-router";
import {
	type FlatList,
	InteractionManager,
	Platform,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { Header } from "../../../components/Header";
import { colors } from "../../../constants/colors";

import { useChat, experimental_useObject as useObject } from "@ai-sdk/react";
import { useCallback, useEffect, useRef } from "react";
import { ErrorCard } from "../../../components/ErrorCard";
import { KeyboardAvoidingView } from "../../../components/KeyboardAvoidingView";
import { apiUrl } from "../../../constants/apiUrl";
import { IMAGES } from "../../../constants/images";
import { ComposerInput } from "../../../features/chat/components/ComposerInput";
import { MessageList } from "../../../features/chat/components/MessageList";
import { usePersistChat } from "../../../features/chat/hooks/usePersistChat";
import { useI18n } from "../../../i18n/i18n";
import { secureFetch } from "../../../services/securityFront";
import { type HistoryItem, storage } from "../../../services/storage";
import { titleSchema } from "../../api/generate-title+api";

export default function ChatWithLily() {
	const { t } = useI18n();
	const { chatId } = useLocalSearchParams();

	const initialChat = useRef(
		storage.get("history")?.find((chat) => chat.id === chatId) as
			| HistoryItem<"chatWithLily">
			| undefined,
	).current;

	const messageListRef = useRef<FlatList>(null);
	const safeAreaInsets = useSafeAreaInsets();
	const inputRef = useRef<TextInput>(null);

	const {
		messages,
		handleInputChange,
		input,
		handleSubmit,
		status,
		error: chatError,
	} = useChat({
		fetch: secureFetch,
		api: `${apiUrl}/api/chat-with-lily`,
		streamProtocol: "data",
		headers: {
			Accept: "text/event-stream",
		},
		initialMessages: initialChat?.value.messages ?? [],
	});

	const {
		error: titleError,
		object: titleObject,
		submit: generateTitle,
		isLoading: isGeneratingTitle,
	} = useObject({
		fetch: secureFetch,
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

	useEffect(() => {
		if (chatId === "new") {
			router.setParams({ chatId: uuid.v4() });
		}
	}, [chatId]);

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

	const error = chatError || titleError;
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
				title={titleObject?.title ?? t("app.lisa_lou_chatbot")}
				type="chatWithLily"
			/>
			<KeyboardAvoidingView
				keyboardOpenedOffset={
					Platform.OS === "ios" ? -safeAreaInsets.bottom : 0
				}
			>
				<MessageList
					users={[{ _id: 1 }, { _id: 2, avatar: IMAGES.LLK_AVATAR }]}
					messages={messages}
					listRef={messageListRef}
					flatListProps={{
						ListHeaderComponent: error
							? () => <ErrorCard error={error} />
							: null,
					}}
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
