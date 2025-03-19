import type React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { Avatar } from "./Avatar";
import VideoPlayer from "./VideoPlayer";
import type { Message, User } from "./MessageList";

interface MessageBubbleProps {
	message: Message;
	user: User;
	position: "left" | "right";
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	user,
	position,
}) => {
	return (
		<View
			style={[
				styles.container,
				position === "right" ? styles.rightContainer : styles.leftContainer,
			]}
		>
			{position === "left" && <Avatar uri={user.avatar} position={position} />}

			<View
				style={[
					styles.bubble,
					position === "right" ? styles.rightBubble : styles.leftBubble,
				]}
			>
				{message.video ? (
					<VideoPlayer videoUri={message.video} />
				) : (
					<Text
						style={[
							styles.text,
							position === "right" ? styles.rightText : styles.leftText,
						]}
					>
						{message.content}
					</Text>
				)}
			</View>

			{position === "right" && <Avatar uri={user.avatar} position={position} />}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		marginVertical: 5,
		alignItems: "flex-end",
	},
	rightContainer: {
		justifyContent: "flex-end",
	},
	leftContainer: {
		justifyContent: "flex-start",
	},
	bubble: {
		maxWidth: "70%",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
		borderCurve: "circular",
	},
	leftBubble: {
		backgroundColor: colors.darkGrey,
		marginLeft: 8,
	},
	rightBubble: {
		backgroundColor: "transparent",
		marginRight: 8,
	},
	text: {
		fontFamily: font.regular,
	},
	leftText: {
		color: colors.white,
	},
	rightText: {
		color: colors.white,
	},
});
