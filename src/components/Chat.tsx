import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import {
	Keyboard,
	Pressable,
	SafeAreaView,
	StyleSheet,
	View,
} from "react-native";
import {
	type IMessage as DefaultIMessage,
	GiftedChat,
	type QuickRepliesProps,
	type Reply,
} from "react-native-gifted-chat";
import { mockedMessages } from "../data/mockedMessages";
import type { IMessage } from "../types/chat";
import { appendToChat } from "../utils/chat/appendToChat";
import { Camera } from "./Camera";
import { QuickReplies } from "./QuickReplies";
import VideoPlayer from "./VideoPlayer";

const AVATAR_USER =
	"https://media.licdn.com/dms/image/v2/C5603AQGUmxHYqgbv2Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516267491614?e=1746662400&v=beta&t=Lnb3HpfKwA5PlxrWX28h-kbsm7dfh4TFwz7U7zh28bQ";

export const Chat: React.FC = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [showCamera, setShowCamera] = useState(false);
	const isQuickReplies = !!messages[0]?.quickReplies;

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
				avatar: AVATAR_USER,
			},
		};

		setMessages((previousMessages) =>
			appendToChat(previousMessages, [userMessage]),
		);
	}, []);

	const toggleShowCamera = useCallback(() => {
		setShowCamera((previous) => !previous);
		Keyboard.dismiss();
	}, []);

	const onVideoCaptured = useCallback((videoUri: string | undefined) => {
		if (!videoUri) return;
		setShowCamera(false);
		setMessages((previousMessages) =>
			appendToChat(previousMessages, [
				{
					_id: Math.round(Math.random() * 1000000),
					video: videoUri,
					text: "",
					user: { _id: 1 },
					createdAt: new Date(),
				},
			]),
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
				renderMessageVideo={(message) => (
					<VideoPlayer videoUri={message.currentMessage.video} />
				)}
				messages={messages as DefaultIMessage[]}
				onSend={(messages) => onSend(messages as IMessage[])}
				user={{
					_id: 1,
				}}
				renderQuickReplies={renderQuickReplies}
				onQuickReply={onQuickReply}
				disableComposer={isQuickReplies}
				showAvatarForEveryMessage={true}
				renderActions={
					isQuickReplies
						? () => null
						: () => (
								<Pressable onPress={toggleShowCamera}>
									<Ionicons
										name="camera"
										size={24}
										color="black"
										style={{ marginBottom: 10, marginLeft: 12 }}
									/>
								</Pressable>
							)
				}
				placeholder={isQuickReplies ? "Faites votre choix" : "Tapez un message"}
				showUserAvatar={true}
			/>
			{showCamera && (
				<View style={[StyleSheet.absoluteFill]}>
					<Camera
						onClose={() => setShowCamera(false)}
						onVideoCaptured={onVideoCaptured}
					/>
				</View>
			)}
		</SafeAreaView>
	);
};
