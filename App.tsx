import React, { useCallback, useEffect, useState } from "react";
import { GiftedChat, type IMessage } from "react-native-gifted-chat";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export function App() {
	const [messages, setMessages] = useState<IMessage[]>([]);

	useEffect(() => {
		setMessages([
			{
				_id: 1,
				text: "Hello developer",
				createdAt: new Date(),
				user: {
					_id: 2,
					name: "React Native",
					avatar: "https://placeimg.com/140/140/any",
				},
			},
		]);
	}, []);

	const onSend = useCallback((messages: IMessage[]) => {
		setMessages((previousMessages) =>
			GiftedChat.append(previousMessages, messages),
		);
	}, []);

	return (
		<SafeAreaProvider>
			<SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
				<GiftedChat
					messages={messages}
					onSend={(messages) => onSend(messages)}
					user={{
						_id: 1,
					}}
				/>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}
