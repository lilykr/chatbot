import { storage } from "../../../services/storage";

import type { UIMessage } from "ai";
import { useEffect } from "react";
import type { HistoryItem } from "../../../services/storage";

type ChatTypes = "chat" | "chatWithLily" | "voiceMode";

export function usePersistChat(params: {
	type: ChatTypes | "rant";
	chatId: string;
	messages?: UIMessage[];
	singleMessage?: string;
	status: string;
	initialChat:
		| HistoryItem<"chat" | "chatWithLily" | "voiceMode" | "rant">
		| undefined;
	title: string | undefined;
	isGeneratingTitle?: boolean;
}) {
	const {
		chatId,
		messages,
		status,
		initialChat,
		title,
		isGeneratingTitle,
		type,
		singleMessage,
	} = params;

	useEffect(() => {
		if (isGeneratingTitle) return;
		if (status === "streaming") return;

		// Handle chat types (chat, chatWithLily, voiceMode)
		if (type !== "rant") {
			if (!messages?.length) return;
			if (messages[messages.length - 1]?.role !== "assistant") return;

			// Skip saving if number of messages hasn't changed from initialChat
			if (
				initialChat &&
				"messages" in initialChat.value &&
				initialChat.value.messages.length === messages.length
			) {
				return;
			}

			const chatValue = {
				title: title ?? "New chat",
				messages,
			};

			if (initialChat) {
				const newChat: HistoryItem<ChatTypes> = {
					...initialChat,
					type,
					value: chatValue,
					updatedAt: Date.now(),
				};
				storage.set("history", (prev) =>
					(prev ?? []).map((item) => (item.id === chatId ? newChat : item)),
				);
			} else {
				storage.set("history", (prev = []) => {
					const existingIndex = prev.findIndex((item) => item.id === chatId);
					const newChat: HistoryItem<ChatTypes> = {
						id: chatId,
						type,
						value: chatValue,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					};

					if (existingIndex !== -1) {
						return prev.map((item, index) =>
							index === existingIndex ? newChat : item,
						);
					}
					return [...prev, newChat];
				});
			}
		} else {
			// Handle rant type
			if (!singleMessage) return;

			const rantValue = {
				rantSubject: title ?? "New rant",
				rantText: singleMessage,
			};

			if (initialChat) {
				const newChat: HistoryItem<"rant"> = {
					...initialChat,
					type: "rant",
					value: rantValue,
					updatedAt: Date.now(),
				};
				storage.set("history", (prev) =>
					(prev ?? []).map((item) => (item.id === chatId ? newChat : item)),
				);
			} else {
				storage.set("history", (prev = []) => {
					const existingIndex = prev.findIndex((item) => item.id === chatId);
					const newChat: HistoryItem<"rant"> = {
						id: chatId,
						type: "rant",
						value: rantValue,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					};

					if (existingIndex !== -1) {
						return prev.map((item, index) =>
							index === existingIndex ? newChat : item,
						);
					}
					return [...prev, newChat];
				});
			}
		}
	}, [
		initialChat,
		status,
		messages,
		title,
		chatId,
		isGeneratingTitle,
		type,
		singleMessage,
	]);
}
