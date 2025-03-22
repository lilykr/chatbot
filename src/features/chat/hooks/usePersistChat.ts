import { storage } from "../../../services/storage";

import type { UIMessage } from "ai";
import { useEffect } from "react";
import type { HistoryItem } from "../../../services/storage";

export function usePersistChat(params: {
	type: "chat" | "chatWithLily" | "voiceMode";
	chatId: string;
	messages: UIMessage[];
	status: string;
	initialChat: HistoryItem<"chat" | "chatWithLily" | "voiceMode"> | undefined;
	title: string | undefined;
	isGeneratingTitle: boolean;
}) {
	const {
		chatId,
		messages,
		status,
		initialChat,
		title,
		isGeneratingTitle,
		type,
	} = params;

	useEffect(() => {
		// Only save if the last message is from the assistant
		if (isGeneratingTitle) return;
		if (messages.length === 0) return;
		if (status === "streaming") return;
		if (messages[messages.length - 1]?.role !== "assistant") return;

		// Skip saving if number of messages hasn't changed from initialChat
		// This assumes messages are only ever added, never edited or replaced
		if (initialChat && initialChat.value.messages.length === messages.length) {
			return;
		}

		if (initialChat) {
			const newChat: HistoryItem = {
				...initialChat,
				value: {
					...initialChat.value,
					messages,
				},
				updatedAt: Date.now(),
			};
			storage.set("history", (prev) =>
				(prev ?? []).map((item) => (item.id === chatId ? newChat : item)),
			);
		} else {
			storage.set("history", (prev = []) => {
				const existingIndex = prev.findIndex((item) => item.id === chatId);
				const newChat = {
					id: chatId as string,
					type: type,
					value: { title: title ?? "New chat", messages },
					createdAt: Date.now(),
					updatedAt: Date.now(),
				};

				if (existingIndex !== -1) {
					// Replace existing chat
					return prev.map((item, index) =>
						index === existingIndex ? newChat : item,
					);
				}
				// Add new chat
				return [...prev, newChat];
			});
		}
	}, [initialChat, status, messages, title, chatId, isGeneratingTitle, type]);
}
