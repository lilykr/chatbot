import type React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "../../../components/Text";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { Avatar } from "./Avatar";
import VideoPlayer from "./VideoPlayer";
import type { Message, User } from "./MessageList";
import { LinearGradient } from "expo-linear-gradient";

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
			{position === "left" && (
				<Avatar source={user.avatar} position={position} />
			)}

			<View
				style={[
					styles.bubble,
					position === "right" ? styles.rightBubble : styles.leftBubble,
				]}
			>
				{message.video ? (
					<VideoPlayer videoUri={message.video} />
				) : (
					<>
						{position === "right" ? (
							<LinearGradient
								colors={["#C26E73", "#AC1ED6"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.gradient}
							>
								<Text style={[styles.text, styles.rightText]}>
									{message.content}
								</Text>
							</LinearGradient>
						) : (
							<Text style={[styles.text, styles.leftText]}>
								{message.content}
							</Text>
						)}
					</>
				)}
			</View>

			{position === "right" && (
				<Avatar source={user.avatar} position={position} />
			)}
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
		borderRadius: 30,
		borderCurve: "circular",
	},
	leftBubble: {
		backgroundColor: colors.darkGrey,
		marginLeft: 8,
		paddingHorizontal: 18,
		paddingVertical: 14,
		borderBottomLeftRadius: 0,
	},
	rightBubble: {
		backgroundColor: "transparent",
		marginRight: 8,
		overflow: "hidden",
		borderBottomRightRadius: 0,
	},
	gradient: {
		paddingHorizontal: 18,
		paddingVertical: 14,
	},
	text: {
		fontFamily: font.regular,
		fontSize: 16,
		lineHeight: 24,
	},
	leftText: {
		color: colors.white,
	},
	rightText: {
		color: colors.white,
	},
});
