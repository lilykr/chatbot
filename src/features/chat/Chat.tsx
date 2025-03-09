import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import type {
	BubbleProps,
	IMessage as DefaultIMessage,
	QuickRepliesProps,
} from "react-native-gifted-chat";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { Camera } from "../camera/Camera";
import { QuickReplies } from "./components/QuickReplies";
import VideoPlayer from "./components/VideoPlayer";
import { AVATAR_USER } from "./data/mockedMessages";
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

	const renderMessageBubble = useCallback(
		(props: Readonly<BubbleProps<DefaultIMessage>>) => {
			return (
				<Bubble
					{...props}
					customWrapper={{
						right: LinearGradient,
					}}
					customWrapperProps={{
						right: {
							colors: ["#C26E73", "#AC1ED6"],
							start: { x: 0, y: 0 },
							end: { x: 1, y: 1 },
						},
					}}
					wrapperStyle={{
						left: { backgroundColor: "#221f20" },
					}}
					textStyle={{
						left: {
							color: "white",
							fontFamily:
								Platform.OS === "android"
									? "Epilogue_400Regular"
									: "Epilogue-Regular",
						},
						right: {
							color: "white",
							fontFamily:
								Platform.OS === "android"
									? "Epilogue_400Regular"
									: "Epilogue-Regular",
						},
					}}
				/>
			);
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
					color={colors.white}
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
				renderBubble={renderMessageBubble}
				// renderSend={() => (
				// 	<Pressable
				// 		style={{
				// 			marginHorizontal: 15,
				// 			marginBottom: 10,
				// 		}}
				// 	>
				// 		<Text
				// 			style={{
				// 				color: colors.vibrantPurple,
				// 				fontSize: 16,
				// 				fontFamily:
				// 					Platform.OS === "android"
				// 						? "Epilogue_500Medium"
				// 						: "Epilogue-Medium",
				// 			}}
				// 		>
				// 			Envoyer
				// 		</Text>
				// 	</Pressable>
				// )}
				renderInputToolbar={(props) => (
					<InputToolbar
						{...props}
						containerStyle={{
							backgroundColor: colors.night,
							borderRadius: 50,
							borderWidth: 1,
							borderColor: colors.white,
							borderTopWidth: 1,
							marginHorizontal: 15,
						}}
					/>
				)}
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
		backgroundColor: colors.night,
	},
});
