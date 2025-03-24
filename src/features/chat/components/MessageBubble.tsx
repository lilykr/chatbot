import type { UIMessage } from "ai";
import { LinearGradient } from "expo-linear-gradient";
import type React from "react";
import { Linking, StyleSheet, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { Avatar } from "./Avatar";
import type { User } from "./MessageList";
import { BouncyPressable } from "../../../components/BouncyPressable";
import { showAlert } from "../../../utils/alert";
import type { ReportReason } from "../../../app/api/report+api";
import { apiUrl } from "../../../constants/apiUrl";

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

	const handleReport = () => {
		showAlert(
			"Report Message",
			"Please select a reason for reporting this message:",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Inappropriate Content",
					onPress: () => handleReportSubmit("inappropriate"),
				},
			],
		);
	};

	const handleReportSubmit = async (reason: ReportReason) => {
		try {
			const response = await fetch(`${apiUrl}/api/report`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messageId: message.id,
					reason,
					messageContent: message.content,
					timestamp: Date.now(),
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to report message: ${response.statusText}`);
			}

			showAlert("Success", "Message reported successfully");
		} catch (error) {
			showAlert("Error", "Failed to report message. Please try again later.", [
				{ text: "OK" },
			]);
		}
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
							<View style={styles.actionButtons}>
								<BouncyPressable
									onPress={handleReport}
									style={styles.actionButton}
								>
									<Ionicons
										name="flag-outline"
										size={16}
										color={colors.white}
									/>
								</BouncyPressable>
							</View>
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
	actionButtons: {
		flexDirection: "row",
		gap: 12,
		marginTop: 4,
		borderTopWidth: 1,
		borderColor: colors.lightGrey,
		width: "100%",
		paddingTop: 12,
		paddingBottom: 8,
	},
	actionButton: {
		padding: 4,
	},
});
