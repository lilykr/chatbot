import { experimental_useObject as useObject } from "@ai-sdk/react";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	InteractionManager,
	StyleSheet,
	type TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";
import { ChatSingleInput } from "../../../components/ChatSingleInput";
import { ErrorCard } from "../../../components/ErrorCard";
import { Header } from "../../../components/Header";
import { ResponseDisplay } from "../../../components/ResponseDisplay";
import { apiUrl } from "../../../constants/apiUrl";
import { colors } from "../../../constants/colors";
import { usePersistChat } from "../../../features/chat/hooks/usePersistChat";
import { useI18n } from "../../../i18n/i18n";
import { secureFetch } from "../../../services/securityFront";
import { type HistoryItem, storage } from "../../../services/storage";
import { rantSchema } from "../../api/chat-rant+api";

export default function AIRant() {
	const { t } = useI18n();
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
		fetch: secureFetch,
		api: `${apiUrl}/api/chat-rant`,
		schema: rantSchema,
	});

	const handleSubmit = useCallback(async () => {
		if (input?.trim().length === 0) return;
		generateRant({ input });
		setRantMessage(input || "");
	}, [input, generateRant]);

	const handleNewRant = useCallback(() => {
		const newRantId = uuid.v4();
		router.replace(`/aiRant/${newRantId}`);
	}, []);

	const handleTopicSelect = useCallback(
		(topic: string) => {
			setInput(topic);
			generateRant({ input: topic });
			setRantMessage(topic);
		},
		[generateRant],
	);

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
					t("app.ai_rant")
				}
				type="rant"
			/>

			{error && <ErrorCard error={error} />}
			<View style={styles.content}>
				{rantMessage !== undefined ? (
					<ResponseDisplay
						content={rantContent?.content ?? initialRant?.value.rantText}
						isLoading={isLoading}
						onNewResponse={handleNewRant}
						newResponseButtonText={t("app.new_rant")}
					/>
				) : (
					<>
						<ChatSingleInput
							input={input ?? ""}
							onInputChange={setInput}
							onSubmit={handleSubmit}
							prompt={t("app.what_would_you_like_me_to_rant_about")}
							placeholder={t("app.enter_a_topic")}
							submitButtonText={t("app.rant")}
							inputRef={inputRef}
							handleTopicSelect={handleTopicSelect}
						/>
					</>
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
