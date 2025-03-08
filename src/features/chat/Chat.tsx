import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type {
	IMessage as DefaultIMessage,
	QuickRepliesProps,
} from "react-native-gifted-chat";
import { GiftedChat } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AVATAR_USER } from "../../data/mockedMessages";
import { Camera } from "../camera/Camera";
import { QuickReplies } from "./QuickReplies";
import VideoPlayer from "./VideoPlayer";
import { useCamera } from "./hooks/useCamera";
import { useChatMessages } from "./hooks/useChatMessages";
import { useKeyboardHeight } from "./hooks/useKeyboardHeight";

export const Chat: React.FC = () => {
	const {
		messages,
		listRef,
		handleSend,
		handleVideoMessage,
		handleQuickReplySelection,
		isQuickReplies,
	} = useChatMessages();
	const { showCamera, openCamera, handleCloseCamera } = useCamera();
	const safeAreaInsets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();

	const renderQuickReplies = useCallback(
		(props: Readonly<QuickRepliesProps<DefaultIMessage>>) => {
			if (!props.currentMessage?.quickReplies) return null;

			return <QuickReplies {...props} />;
		},
		[],
	);

	const renderActions = useCallback(() => {
		if (isQuickReplies) return null;

		return (
			<Pressable onPress={openCamera}>
				<Ionicons
					name="camera"
					size={24}
					color="black"
					style={{ marginBottom: 10, marginLeft: 12 }}
				/>
			</Pressable>
		);
	}, [isQuickReplies, openCamera]);

	const renderMessageVideo = useCallback(
		(props: { currentMessage: DefaultIMessage }) => (
			<VideoPlayer videoUri={props.currentMessage.video} />
		),
		[],
	);

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: safeAreaInsets.top,
					paddingBottom: safeAreaInsets.bottom,
				},
			]}
		>
			<GiftedChat
				listViewProps={{
					ref: listRef,
					contentContainerStyle: {
						paddingBottom: keyboardHeight,
					},
				}}
				renderMessageVideo={renderMessageVideo}
				messages={messages as DefaultIMessage[]}
				onSend={handleSend}
				user={{
					_id: 1,
					avatar: AVATAR_USER,
				}}
				renderQuickReplies={renderQuickReplies}
				onQuickReply={handleQuickReplySelection}
				disableComposer={isQuickReplies}
				showAvatarForEveryMessage={true}
				renderActions={renderActions}
				placeholder={isQuickReplies ? "Faites votre choix" : "Tapez un message"}
				showUserAvatar={true}
			/>
			{showCamera && (
				<View style={StyleSheet.absoluteFill}>
					<Camera
						onClose={handleCloseCamera}
						onVideoCaptured={handleVideoMessage}
					/>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
});
