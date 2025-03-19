import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";
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
import { colors } from "../constants/colors";
import { font } from "../constants/font";
import { Camera } from "../features/camera/Camera";
import { QuickReplies } from "../features/chat/components/QuickReplies";
import VideoPlayer from "../features/chat/components/VideoPlayer";
import { AVATAR_USER } from "../features/chat/data/mockedMessages";
import { useCamera } from "../features/chat/hooks/useCamera";
import { useChatMessages } from "../features/chat/hooks/useChatMessages";
import { useKeyboardHeight } from "../features/chat/hooks/useKeyboardHeight";
import { useChat } from "@ai-sdk/react";
import { fetch as expoFetch } from "expo/fetch";
import { generateAPIUrl } from "../utils/generateAPIUrl";
import { Text } from "../components/Text";

export default function Chat() {
	const {
		listRef,
		// handleSend,
		handleVideoMessage,
		handleQuickReplySelection,
		isQuickReplies,
		// messages
	} = useChatMessages();

	const { messages, error, handleInputChange, input, handleSubmit } = useChat({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		// TODO: fix for PROD with https://docs.expo.dev/router/reference/api-routes/
		api: "http://localhost:8081/api/chat",
		onError: (error) => console.error(error, "ERROR"),
		onResponse: (response) => console.log(response, "RESPONSE"),
		streamProtocol: "data",
		headers: {
			Accept: "text/event-stream",
		},
	});

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
					// customWrapper={{
					// 	right: LinearGradient,
					// }}
					// customWrapperProps={{
					// 	right: {
					// 		colors: ["#C26E73", "#AC1ED6"],
					// 		start: { x: 0, y: 0 },
					// 		end: { x: 1, y: 1 },
					// 	},
					// }}
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

	if (error) return <Text style={{ color: "white" }}>{error.message}</Text>;

	return (
		<View
			style={{
				height: "95%",
				display: "flex",
				flexDirection: "column",
				paddingHorizontal: 8,
			}}
		>
			<ScrollView style={{ flex: 1 }}>
				{messages.map((m) => (
					<View key={m.id} style={{ marginVertical: 8 }}>
						<View>
							<Text style={{ fontWeight: 700, color: "white" }}>{m.role}</Text>
							<Text style={{ color: "white" }}>{m.content}</Text>
						</View>
					</View>
				))}
			</ScrollView>

			<View style={{ marginTop: 8 }}>
				<TextInput
					style={{ backgroundColor: "white", padding: 8 }}
					placeholder="Say something..."
					value={input}
					onChange={(e) =>
						handleInputChange({
							...e,
							target: {
								...e.target,
								value: e.nativeEvent.text,
							},
						} as unknown as React.ChangeEvent<HTMLInputElement>)
					}
					onSubmitEditing={(e) => {
						handleSubmit(e);
						e.preventDefault();
					}}
					autoFocus={true}
				/>
			</View>
		</View>
		// <View
		// 	style={[
		// 		styles.container,
		// 		{
		// 			paddingTop: safeAreaInsets.top,
		// 			paddingBottom: safeAreaInsets.bottom,
		// 		},
		// 	]}
		// 	onLayout={handleLayout}
		// >
		// 	<GiftedChat
		// 		listViewProps={{
		// 			ref: listRef,
		// 			contentContainerStyle: {
		// 				paddingBottom: keyboardHeight,
		// 			},
		// 		}}
		// 		renderMessageVideo={renderMessageVideo}
		// 		messages={messages as DefaultIMessage[]}
		// 		onSend={handleSend}
		// 		user={{
		// 			_id: 1,
		// 			avatar: AVATAR_USER,
		// 		}}
		// 		renderQuickReplies={renderQuickReplies}
		// 		onQuickReply={handleQuickReplySelection}
		// 		disableComposer={isQuickReplies}
		// 		renderActions={renderActions}
		// 		placeholder={isQuickReplies ? "Faites votre choix" : "Tapez un message"}
		// 		renderComposer={renderComposer}
		// 		timeTextStyle={{
		// 			left: { display: "none" },
		// 			right: { display: "none" },
		// 		}}
		// 		showUserAvatar={true}
		// 		renderBubble={renderMessageBubble}
		// 		renderAvatar={renderAvatar}
		// 		renderSend={renderSend}
		// 		renderInputToolbar={renderInputToolbar}
		// 	/>
		// 	{showCamera && (
		// 		<View style={StyleSheet.absoluteFill}>
		// 			<Camera
		// 				onClose={handleCloseCamera}
		// 				onVideoCaptured={handleVideoMessage}
		// 			/>
		// 		</View>
		// 	)}
		// </View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
});
