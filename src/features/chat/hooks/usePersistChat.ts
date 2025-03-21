import { storage } from "../../../services/storage";

import type { UIMessage } from "ai";
import { useEffect } from "react";
import type { HistoryItem } from "../../../services/storage";

export function usePersistChat(params: {
	chatId: string;
	messages: UIMessage[];
	status: string;
	initialChat: HistoryItem<"chat"> | undefined;
	title: string | undefined;
	isGeneratingTitle: boolean;
}) {
	const { chatId, messages, status, initialChat, title, isGeneratingTitle } =
		params;

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

		const history = storage.get("history") ?? [];

		if (initialChat) {
			const newChat: HistoryItem = {
				...initialChat,
				value: {
					...initialChat.value,
					messages,
				},
				updatedAt: Date.now(),
			};
			// Replace the existing chat instead of appending
			storage.set("history", (prev) =>
				(prev ?? []).map((item) => (item.id === chatId ? newChat : item)),
			);
		}
		if (!initialChat) {
			storage.set("history", [
				...history,
				{
					id: chatId as string,
					type: "chat",
					value: { title: title ?? "New chat", messages },
					createdAt: Date.now(),
					updatedAt: Date.now(),
				},
			]);
		}
	}, [initialChat, status, messages, title, chatId, isGeneratingTitle]);
}
