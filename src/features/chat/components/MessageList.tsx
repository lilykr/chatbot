import type React from "react";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { LegendList, type LegendListRef } from "@legendapp/list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageBubble } from "./MessageBubble";
import { useKeyboardHeight } from "../hooks/useKeyboardHeight";
import { colors } from "../../../constants/colors";
import type { UIMessage } from "ai";

export interface User {
	_id: string | number;
	avatar?: string;
}

interface MessageListProps {
	messages: UIMessage[];
	users: User[];
	listRef?: React.RefObject<LegendListRef>;
}

export const MessageList: React.FC<MessageListProps> = ({
	messages,
	users,
	listRef,
}) => {
	const safeAreaInsets = useSafeAreaInsets();
	const keyboardHeight = useKeyboardHeight();

	const findUser = useCallback(
		(userId: string | number) => {
			const user = users.find((u) => u._id === userId);
			if (!user) {
				throw new Error(`User not found for ID: ${userId}`);
			}
			return user;
		},
		[users],
	);

	const renderItem = useCallback(
		({ item }: { item: UIMessage }) => {
			const user = findUser(item.role === "user" ? 1 : 2);
			return (
				<MessageBubble
					message={item}
					user={user}
					position={item.role === "user" ? "right" : "left"}
				/>
			);
		},
		[findUser],
	);

	const keyExtractor = useCallback((item: UIMessage) => {
		return item.id;
	}, []);

	return (
		<View style={[styles.container]}>
			<LegendList
				ref={listRef}
				data={messages}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				estimatedItemSize={100}
				contentContainerStyle={{
					paddingBottom: keyboardHeight,
					paddingHorizontal: 10,
				}}
				maintainVisibleContentPosition={true}
				alignItemsAtEnd={true}
				maintainScrollAtEnd={true}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
});
