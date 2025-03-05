import { useCallback, useEffect, useState } from "react";
import { type BubbleProps, GiftedChat } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockedMessages } from "../data/mockedMessages";
import type { IMessage } from "../types/chat";
import { OptionSelector } from "./OptionSelector";

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

	const renderCustomView = useCallback(
		(props: Readonly<BubbleProps<IMessage>>) => {
			if (!props.currentMessage?.mutipleChoices) return null;
			return (
				<OptionSelector
					{...props}
					options={props.currentMessage.mutipleChoices.options}
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
				renderCustomView={renderCustomView}
			/>
		</SafeAreaView>
	);
};
