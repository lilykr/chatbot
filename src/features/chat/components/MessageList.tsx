import type { UIMessage } from "ai";
import type React from "react";
import { useCallback } from "react";
import type { FlatListProps } from "react-native";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";
import { MessageBubble } from "./MessageBubble";

export interface User {
	_id: string | number;
	avatar?: string;
}

interface MessageListProps {
	messages: UIMessage[];
	users: User[];
	listRef?: React.RefObject<FlatList>;
	flatListProps?: Partial<FlatListProps<UIMessage>>;
}

export const MessageList: React.FC<MessageListProps> = ({
	messages,
	users,
	listRef,
	flatListProps,
}) => {
	const safeAreaInsets = useSafeAreaInsets();

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
			<FlatList
				ref={listRef}
				data={messages.toReversed()}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={{
					paddingBottom: safeAreaInsets.top + 60,
					paddingHorizontal: 10,
				}}
				inverted
				keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
				{...flatListProps}
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
