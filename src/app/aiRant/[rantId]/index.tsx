import { experimental_useObject as useObject } from "@ai-sdk/react";
import { router, useLocalSearchParams } from "expo-router";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	InteractionManager,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { ChatSingleInput } from "../../../components/ChatSingleInput";
import { Header } from "../../../components/Header";
import { ResponseDisplay } from "../../../components/ResponseDisplay";
import { Text } from "../../../components/Text";
import { apiUrl } from "../../../constants/apiUrl";
import { colors } from "../../../constants/colors";
import { usePersistChat } from "../../../features/chat/hooks/usePersistChat";
import { type HistoryItem, storage } from "../../../services/storage";
import { rantSchema } from "../../api/chat-rant+api";

export default function AIRant() {
	const { rantId } = useLocalSearchParams();

	const initialRant = useRef(
		storage.get("history")?.find((rant) => rant.id === rantId) as
			| HistoryItem<"rant">
			| undefined,
	).current;
	const inputRef = useRef<TextInput>(null);

	const [input, setInput] = useState<string | undefined>(undefined);
	const [rantMessage, setRantMessage] = useState<string | undefined>(undefined);
	const safeAreaInsets = useSafeAreaInsets();

	const {
		object: rantContent,
		submit: generateRant,
		error,
		isLoading,
	} = useObject({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		api: `${apiUrl}/api/chat-rant`,
		schema: rantSchema,
	});

	const handleSubmit = useCallback(async () => {
		if (input?.trim().length === 0) return;
		generateRant({ input });
		setRantMessage(rantContent?.content || "");
	}, [input, rantContent?.content, generateRant]);

	const handleNewRant = useCallback(() => {
		setInput("");
		setRantMessage(undefined);
	}, []);

	useEffect(() => {
		if (initialRant) {
			setRantMessage(initialRant.value.rantText);
		}
	}, [initialRant]);

	useEffect(() => {
		if (rantId === "new") {
			router.setParams({ rantId: uuid.v4() });
			setTimeout(() => {
				InteractionManager.runAfterInteractions(() => {
					inputRef.current?.focus();
				});
			}, 560);
		}
	}, [rantId]);

	usePersistChat({
		chatId: rantId as string,
		singleMessage: rantContent?.content ?? "",
		initialChat: initialRant,
		title: input,
		type: "rant",
		status: "success",
	});

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
		>
			<Header
				title={
					initialRant?.value.rantSubject ??
					(rantMessage && input) ??
					"AI Rant Mode"
				}
				type="rant"
			/>
			<View style={styles.content}>
				{rantMessage !== undefined ? (
					<ResponseDisplay
						content={rantContent?.content ?? initialRant?.value.rantText}
						isLoading={isLoading}
						onNewResponse={handleNewRant}
					/>
				) : (
					<ChatSingleInput
						input={input ?? ""}
						onInputChange={setInput}
						onSubmit={handleSubmit}
						prompt="What would you like me to rant about?"
						placeholder="Enter a topic..."
						submitButtonText="Rant"
						inputRef={inputRef}
					/>
				)}
			</View>
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
		alignItems: "center",
	},
});
