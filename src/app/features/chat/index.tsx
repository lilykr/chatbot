import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type {
	AvatarProps,
	BubbleProps,
	ComposerProps,
	IMessage as DefaultIMessage,
	InputToolbarProps,
	QuickRepliesProps,
	SendProps,
} from "react-native-gifted-chat";
import {
	Avatar,
	Bubble,
	Composer,
	GiftedChat,
	InputToolbar,
	Send,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { Camera } from "../camera/Camera";
import { QuickReplies } from "./components/QuickReplies";
import VideoPlayer from "./components/VideoPlayer";
import { AVATAR_USER } from "./data/mockedMessages";
import { useCamera } from "./hooks/useCamera";
import { useChatMessages } from "./hooks/useChatMessages";
import { useKeyboardHeight } from "./hooks/useKeyboardHeight";

export default function Chat() {
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

	const handleLayout = useCallback(() => {
		SplashScreen.hideAsync();
	}, []);

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
						left: {
							backgroundColor: "#221f20",
							padding: 8,
							borderCurve: "circular",
						},
						right: {
							padding: 8,
							backgroundColor: "transparent",
							borderCurve: "circular",
						},
					}}
					textStyle={{
						left: {
							marginBottom: 0,
							color: "white",
							fontFamily: font.regular,
						},
						right: {
							marginBottom: 0,
							color: "white",
							fontFamily: font.regular,
						},
					}}
				/>
			);
		},
		[],
	);

	const renderAvatar = useCallback(
		(props: Readonly<AvatarProps<DefaultIMessage>>) => {
			return (
				<Avatar
					imageStyle={{
						left: { width: 27, height: 27 },
						right: { width: 27, height: 27 },
					}}
					containerStyle={{
						left: {
							borderWidth: 1,
							borderColor: colors.lightGrey,
							borderRadius: 100,
						},
					}}
					currentMessage={props.currentMessage}
					position={props.position}
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

	const renderComposer = useCallback((props: Readonly<ComposerProps>) => {
		return <Composer {...props} textInputStyle={{ color: colors.white }} />;
	}, []);

	const renderInputToolbar = useCallback(
		(props: Readonly<InputToolbarProps<DefaultIMessage>>) => {
			return (
				<InputToolbar
					{...props}
					containerStyle={{
						backgroundColor: colors.night,
						borderRadius: 50,
						borderWidth: 1,
						borderColor: isQuickReplies ? colors.lightGrey : colors.white,
						borderTopWidth: 1,
						borderTopColor: isQuickReplies ? colors.lightGrey : colors.white,
						marginHorizontal: 15,
						marginBottom: 10,
						borderCurve: "circular",
					}}
				/>
			);
		},
		[isQuickReplies],
	);

	const renderSend = useCallback(
		(props: Readonly<SendProps<DefaultIMessage>>) => {
			return (
				<Send
					{...props}
					containerStyle={{
						marginHorizontal: 15,
					}}
					textStyle={{
						color: colors.vibrantPurple,
						fontSize: 16,
						fontFamily: font.medium,
					}}
					label="Envoyer"
				/>
			);
		},
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
			onLayout={handleLayout}
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
				renderActions={renderActions}
				placeholder={isQuickReplies ? "Faites votre choix" : "Tapez un message"}
				renderComposer={renderComposer}
				timeTextStyle={{
					left: { display: "none" },
					right: { display: "none" },
				}}
				showUserAvatar={true}
				renderBubble={renderMessageBubble}
				renderAvatar={renderAvatar}
				renderSend={renderSend}
				renderInputToolbar={renderInputToolbar}
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
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
});
