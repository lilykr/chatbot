import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type FlatList,
	Keyboard,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import {
	type IMessage as DefaultIMessage,
	GiftedChat,
	type QuickRepliesProps,
	type Reply,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AVATAR_USER, mockedMessages } from "../data/mockedMessages";
import { useChatResponses } from "../hooks/useChatResponses";
import { useKeyboardHeight } from "../hooks/useKeyboardHeight";
import type { IMessage } from "../types/chat";
import { appendToChat } from "../utils/chat/appendToChat";
import { Camera } from "./Camera";
import { QuickReplies } from "./QuickReplies";
import VideoPlayer from "./VideoPlayer";

export const Chat: React.FC = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [showCamera, setShowCamera] = useState(false);
	const { getPersonalitySelectionMessage, handleQuickReply } =
		useChatResponses();

	const isQuickReplies = !!messages[0]?.quickReplies;

	const safeAreaInsets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();

	const listRef = useRef<FlatList>(null);

	useEffect(() => {
		setMessages(mockedMessages);
	}, []);

	const onSend = useCallback((messages: IMessage[]) => {
		setMessages((previousMessages) => appendToChat(previousMessages, messages));
		listRef.current?.scrollToIndex({ index: 0, animated: true });
	}, []);

	const onQuickReply = useCallback(
		(replies: Reply[]) => {
			if (!replies.length) return;
			const reply = replies[0];
			if (!reply) return;

			const {
				userMessage,
				shouldShowPersonalitySelection,
				botResponse,
				followUpMessage,
			} = handleQuickReply(reply);

			setMessages((previousMessages) =>
				appendToChat(previousMessages, [userMessage]),
			);

			if (shouldShowPersonalitySelection) {
				setTimeout(() => {
					const personalityMessage = getPersonalitySelectionMessage();
					setMessages((previousMessages) =>
						appendToChat(previousMessages, [personalityMessage]),
					);
				}, 500);
			} else if (botResponse) {
				setTimeout(() => {
					setMessages((previousMessages) =>
						appendToChat(previousMessages, [botResponse]),
					);

					if (followUpMessage) {
						setTimeout(() => {
							setMessages((previousMessages) =>
								appendToChat(previousMessages, [followUpMessage]),
							);
						}, 1000);
					}
				}, 500);
			}
		},
		[handleQuickReply, getPersonalitySelectionMessage],
	);

	const toggleShowCamera = useCallback(() => {
		setShowCamera((previous) => !previous);
		Keyboard.dismiss();
	}, []);

	const onVideoCaptured = useCallback((videoUri: string | undefined) => {
		if (!videoUri) return;
		setMessages((previousMessages) =>
			appendToChat(previousMessages, [
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

	const onCloseCamera = useCallback(() => {
		setShowCamera(false);
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
		<View
			style={{
				flex: 1,
				backgroundColor: "white",
				paddingTop: safeAreaInsets.top,
				paddingBottom: safeAreaInsets.bottom,
			}}
		>
			<GiftedChat
				listViewProps={{
					ref: listRef,
					contentContainerStyle: {
						paddingBottom: keyboardHeight,
					},
				}}
				renderMessageVideo={(message) => (
					<VideoPlayer videoUri={message.currentMessage.video} />
				)}
				messages={messages as DefaultIMessage[]}
				onSend={(messages) => onSend(messages as IMessage[])}
				user={{
					_id: 1,
					avatar: AVATAR_USER,
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
					<Camera onClose={onCloseCamera} onVideoCaptured={onVideoCaptured} />
				</View>
			)}
		</View>
	);
};
