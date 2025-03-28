import type { UIMessage } from "ai";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { Linking, StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { ActionButtons } from "../../../components/ActionButtons";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { Avatar } from "./Avatar";
import type { User } from "./MessageList";

interface MessageBubbleProps {
	message: UIMessage;
	user: User;
	position: "left" | "right";
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
	message,
	user,
	position,
}) => {
	const handleLinkPress = (url: string) => {
		Linking.openURL(url);
		return false;
	};

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

			<View style={styles.messageContainer}>
				<View
					style={[
						styles.bubble,
						position === "right" ? styles.rightBubble : styles.leftBubble,
					]}
				>
					{position === "right" ? (
						<LinearGradient
							colors={["#C26E73", "#AC1ED6"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={styles.gradient}
						>
							<Markdown
								style={{
									body: {
										...styles.text,
										...styles.rightText,
									},
									link: {
										...styles.link,
										color: colors.white,
									},
								}}
								onLinkPress={handleLinkPress}
							>
								{message.content}
							</Markdown>
						</LinearGradient>
					) : (
						<>
							<Markdown
								style={{
									body: {
										...styles.text,
										...styles.leftText,
									},
									link: {
										...styles.link,
										color: colors.white,
									},
									fence: {
										backgroundColor: "black",
									},
									code_inline: {
										backgroundColor: "black",
									},
								}}
								onLinkPress={handleLinkPress}
							>
								{message.content}
							</Markdown>
							<ActionButtons content={message.content} />
						</>
					)}
				</View>
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
	messageContainer: {
		maxWidth: "70%",
	},
	bubble: {
		borderRadius: 30,
		borderCurve: "circular",
	},
	leftBubble: {
		backgroundColor: colors.darkGrey,
		marginLeft: 8,
		paddingHorizontal: 18,
		paddingVertical: 2,
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
		paddingVertical: 2,
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
	link: {
		textDecorationLine: "underline" as const,
	},
});
