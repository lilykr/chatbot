import { useCallback, useEffect, useState } from "react";
import { GiftedChat, type QuickRepliesProps } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockedMessages } from "../data/mockedMessages";
import type { IMessage } from "../types/chat";
import { QuickReplies } from "./QuickReplies";

export const Chat: React.FC = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);

	useEffect(() => {
		setMessages(mockedMessages);
	}, []);

	const onSend = useCallback((messages: IMessage[]) => {
		setMessages((previousMessages) =>
			GiftedChat.append(previousMessages, messages),
		);
	}, []);

	const renderQuickReplies = useCallback(
		(props: Readonly<QuickRepliesProps<IMessage>>) => {
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
				messages={messages}
				onSend={(messages) => onSend(messages)}
				user={{
					_id: 1,
				}}
				renderQuickReplies={renderQuickReplies}
			/>
		</SafeAreaView>
	);
};
