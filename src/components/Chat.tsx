import { useCallback, useEffect, useState } from "react";
import {
	type IMessage as DefaultIMessage,
	GiftedChat,
	type QuickRepliesProps,
	type Reply,
} from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockedMessages } from "../data/mockedMessages";
import type { IMessage } from "../types/chat";
import { appendToChat } from "../utils/chat/appendToChat";
import { QuickReplies } from "./QuickReplies";

export const Chat: React.FC = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);

	useEffect(() => {
		setMessages(mockedMessages);
	}, []);

	const onSend = useCallback((messages: IMessage[]) => {
		setMessages((previousMessages) => appendToChat(previousMessages, messages));
	}, []);

	const onQuickReply = useCallback((replies: Reply[]) => {
		if (!replies.length) return;
		const reply = replies[0]; // Since we're using 'radio' type, we'll only have one reply
		if (!reply) return;
		// Create a user message showing their selection
		const userMessage: IMessage = {
			_id: Math.round(Math.random() * 1000000),
			text: reply.title,
			createdAt: new Date(),
			user: {
				_id: 1,
			},
		};

		setMessages((previousMessages) =>
			appendToChat(previousMessages, [userMessage]),
		);
	}, []);

	const renderQuickReplies = useCallback(
		(props: Readonly<QuickRepliesProps<DefaultIMessage>>) => {
			const {
				currentMessage,
				onQuickReply,
				nextMessage,
				renderQuickReplySend,
				quickReplyStyle,
				quickReplyTextStyle,
				quickReplyContainerStyle,
			} = props;

			if (!currentMessage?.quickReplies) return null;

			return (
				<QuickReplies
					currentMessage={currentMessage}
					onQuickReply={onQuickReply}
					renderQuickReplySend={renderQuickReplySend}
					quickReplyStyle={quickReplyStyle}
					quickReplyTextStyle={quickReplyTextStyle}
					quickReplyContainerStyle={quickReplyContainerStyle}
					nextMessage={nextMessage}
				/>
			);
		},
		[],
	);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
			<GiftedChat
				messages={messages as DefaultIMessage[]}
				onSend={(messages) => onSend(messages as IMessage[])}
				user={{
					_id: 1,
				}}
				renderQuickReplies={renderQuickReplies}
				onQuickReply={onQuickReply}
			/>
		</SafeAreaView>
	);
};
