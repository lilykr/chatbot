import { useCallback, useRef, useState } from "react";
import type { FlatList } from "react-native";
import type {
	IMessage as DefaultIMessage,
	Reply,
} from "react-native-gifted-chat";
import { AVATAR_USER, mockedMessages } from "../data/mockedMessages";
import type { IMessage } from "../types/chat";
import { appendToChat } from "../utils/appendToChat";
import {
	getPersonalitySelectionMessage,
	handleQuickReply,
} from "../utils/chatResponses";

const QUICK_REPLY_DELAY = 500;
const FOLLOW_UP_DELAY = 1000;

export const useChatMessages = () => {
	const [messages, setMessages] = useState<IMessage[]>(mockedMessages);
	const listRef = useRef<FlatList>(null);

	const handleSend = useCallback((newMessages: DefaultIMessage[]) => {
		setMessages((prev) => appendToChat(prev, newMessages as IMessage[]));
		listRef.current?.scrollToIndex({ index: 0, animated: true });
	}, []);

	const handleVideoMessage = useCallback((videoUri: string | undefined) => {
		if (!videoUri) return;
		setMessages((prev) =>
			appendToChat(prev, [
				{
					_id: Math.round(Math.random() * 1000000),
					video: videoUri,
					text: "",
					user: { _id: 1, avatar: AVATAR_USER },
					createdAt: new Date(),
				},
			]),
		);
	}, []);

	const handleQuickReplySelection = useCallback((replies: Reply[]) => {
		const reply = replies[0];
		if (!reply) return;

		const {
			userMessage,
			shouldShowPersonalitySelection,
			botResponse,
			followUpMessage,
		} = handleQuickReply(reply);

		setMessages((prev) => appendToChat(prev, [userMessage]));

		if (shouldShowPersonalitySelection) {
			setTimeout(() => {
				setMessages((prev) =>
					appendToChat(prev, [getPersonalitySelectionMessage()]),
				);
			}, QUICK_REPLY_DELAY);
		} else if (botResponse) {
			setTimeout(() => {
				setMessages((prev) => appendToChat(prev, [botResponse]));
				if (followUpMessage) {
					setTimeout(() => {
						setMessages((prev) => appendToChat(prev, [followUpMessage]));
					}, FOLLOW_UP_DELAY);
				}
			}, QUICK_REPLY_DELAY);
		}
	}, []);

	const isQuickReplies = !!messages[0]?.quickReplies;

	return {
		messages,
		listRef,
		handleSend,
		handleVideoMessage,
		handleQuickReplySelection,
		isQuickReplies,
	};
};
