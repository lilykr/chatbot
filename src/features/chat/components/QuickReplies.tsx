import PropTypes from "prop-types";
import type React from "react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
	type StyleProp,
	StyleSheet,
	type TextStyle,
	TouchableOpacity,
	View,
	type ViewStyle,
} from "react-native";
import { type Reply, StylePropType } from "react-native-gifted-chat";
import { Text } from "../../../components/Text";
import { colors } from "../../../constants/colors";
import type { CarouselReply, IMessage } from "../types/chat";
import { Carousel } from "./Carousel";

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		flexWrap: "wrap",
		maxWidth: 300,
	},
	carouselContainer: {
		width: "100%",
		maxWidth: "100%",
		alignSelf: "flex-start",
	},
	quickReply: {
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		maxWidth: 200,
		paddingVertical: 7,
		paddingHorizontal: 12,
		minHeight: 50,
		borderRadius: 13,
		margin: 3,
	},
	quickReplyText: {
		overflow: "visible",
	},
	sendLink: {
		borderWidth: 0,
	},
	sendLinkText: {
		fontWeight: "600",
		fontSize: 17,
	},
});

export interface QuickRepliesProps<TMessage extends IMessage = IMessage> {
	nextMessage?: TMessage | undefined;
	currentMessage: TMessage;
	color?: string;
	sendText?: string;
	quickReplyStyle?: StyleProp<ViewStyle>;
	quickReplyTextStyle?: StyleProp<TextStyle>;
	quickReplyContainerStyle?: StyleProp<ViewStyle>;
	onQuickReply?: ((reply: Reply[]) => void) | undefined;
	renderQuickReplySend?: (() => ReactNode) | undefined;
}

const sameReply = (currentReply: Reply) => (reply: Reply) =>
	currentReply.value === reply.value;

const diffReply = (currentReply: Reply) => (reply: Reply) =>
	currentReply.value !== reply.value;

// Default component from the gifted-chat library

export function QuickReplies({
	currentMessage,
	nextMessage,
	color = colors.vibrantPurple,
	quickReplyStyle,
	quickReplyTextStyle,
	quickReplyContainerStyle,
	onQuickReply,
	sendText = "Send",
	renderQuickReplySend,
}: QuickRepliesProps<IMessage>) {
	if (!currentMessage?.quickReplies) return null;

	const { type } = currentMessage.quickReplies;
	const [replies, setReplies] = useState<Reply[]>([]);

	const shouldComponentDisplay = useMemo(() => {
		const hasReplies = !!currentMessage && !!currentMessage.quickReplies;
		const hasNext = !!nextMessage && !!nextMessage._id;
		const keepIt = currentMessage.quickReplies?.keepIt;

		if (hasReplies && !hasNext) return true;

		if (hasReplies && hasNext && keepIt) return true;

		return false;
	}, [currentMessage, nextMessage]);

	const handlePress = useCallback(
		(reply: Reply) => () => {
			if (currentMessage?.quickReplies) {
				const { type } = currentMessage.quickReplies;
				switch (type) {
					case "radio": {
						handleSend([reply])();
						return;
					}
					case "checkbox": {
						if (replies.find(sameReply(reply)))
							setReplies(replies.filter(diffReply(reply)));
						else setReplies([...replies, reply]);
						return;
					}
					default: {
					}
				}
			}
		},
		[replies, currentMessage],
	);

	const handleCarouselSelect = useCallback((reply: CarouselReply) => {
		handleSend([reply])();
	}, []);

	const handleSend = (repliesData: Reply[]) => () => {
		onQuickReply?.(
			repliesData.map((reply: Reply) => ({
				...reply,
				messageId: currentMessage._id,
			})),
		);
	};

	if (!shouldComponentDisplay) return null;

	if (type === "carousel") {
		return (
			<View style={styles.carouselContainer}>
				<Carousel
					items={currentMessage.quickReplies.values as CarouselReply[]}
					onSelect={handleCarouselSelect}
					color={color}
				/>
			</View>
		);
	}

	return (
		<View style={[styles.container, quickReplyContainerStyle]}>
			{currentMessage.quickReplies.values.map((reply: Reply, index: number) => {
				const selected = type === "checkbox" && replies.find(sameReply(reply));

				return (
					<TouchableOpacity
						onPress={handlePress(reply)}
						style={[
							styles.quickReply,
							quickReplyStyle,
							{ borderColor: color },
							selected && { backgroundColor: color },
						]}
						key={`${reply.value}-${index}`}
					>
						<Text
							numberOfLines={10}
							ellipsizeMode="tail"
							style={[
								styles.quickReplyText,
								{ color: selected ? "white" : color },
								quickReplyTextStyle,
							]}
						>
							{reply.title}
						</Text>
					</TouchableOpacity>
				);
			})}
			{replies.length > 0 && (
				<TouchableOpacity
					style={[styles.quickReply, styles.sendLink]}
					onPress={handleSend(replies)}
				>
					{renderQuickReplySend?.() || (
						<Text style={styles.sendLinkText}>{sendText}</Text>
					)}
				</TouchableOpacity>
			)}
		</View>
	);
}

QuickReplies.propTypes = {
	currentMessage: PropTypes.object.isRequired,
	onQuickReply: PropTypes.func,
	color: PropTypes.string,
	sendText: PropTypes.string,
	renderQuickReplySend: PropTypes.func,
	quickReplyStyle: StylePropType,
};
