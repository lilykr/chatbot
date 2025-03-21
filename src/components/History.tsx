import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { MMKV } from "react-native-mmkv";
import { Text } from "./Text";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const storage = new MMKV();

interface ChatHistory {
	id: string;
	title: string;
	lastMessage: string;
	timestamp: number;
}

export const History = () => {
	const [histories, setHistories] = useState<ChatHistory[]>([]);

	useEffect(() => {
		loadHistories();
	}, []);

	const loadHistories = () => {
		const savedHistories = storage.getString("chatHistories");
		if (savedHistories) {
			setHistories(JSON.parse(savedHistories));
		}
	};

	const handleChatPress = (id: string) => {
		router.push("/chat");
	};

	return (
		<View style={styles.container}>
			<Text weight="medium" style={styles.title}>
				Recent Chats
			</Text>
			{histories.map((history) => (
				<TouchableOpacity
					key={history.id}
					style={styles.historyItem}
					onPress={() => handleChatPress(history.id)}
				>
					<View style={styles.historyContent}>
						<Text style={styles.historyTitle}>{history.title}</Text>
						<Text style={styles.lastMessage} numberOfLines={1}>
							{history.lastMessage}
						</Text>
					</View>
					<Ionicons name="chevron-forward" size={24} color={colors.white} />
				</TouchableOpacity>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 24,
		paddingHorizontal: 16,
	},
	title: {
		color: colors.white,
		fontSize: 20,
		marginBottom: 16,
	},
	historyItem: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.darkGrey,
		padding: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	historyContent: {
		flex: 1,
		marginRight: 12,
	},
	historyTitle: {
		color: colors.white,
		fontSize: 16,
		marginBottom: 4,
	},
	lastMessage: {
		color: colors.lightGrey,
		fontSize: 14,
	},
});
