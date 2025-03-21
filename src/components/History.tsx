import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { storage } from "../services/storage";
import type { App } from "../types/apps";
import { BouncyPressable } from "./BouncyPressable";
import { Text } from "./Text";

const getHistoryTitle = (type: App["type"]) => {
	switch (type) {
		case "chat":
			return "Chat";
		case "voice":
			return "Voice";
		case "rant":
			return "Rant";
		default:
			return "";
	}
};

const getHistoryContent = (item: App) => {
	switch (item.type) {
		case "chat":
		case "voice":
			return item.value.title;
		case "rant":
			return item.value.rantSubject;
		default:
			return "";
	}
};

export const History = () => {
	const [histories, setHistories] = useState(storage.get("history"));
	const handleChatPress = (id: string) => {
		router.push(`/chat/${id}`);
	};

	useEffect(() => {
		storage.listen("history", (newHistory) => {
			setHistories(newHistory);
		});
	}, []);

	return (
		<View style={styles.container}>
			<Text weight="medium" style={styles.title}>
				History
			</Text>
			<FlatList
				data={histories?.sort((a, b) => b.updatedAt - a.updatedAt)}
				renderItem={({ item, index }) => (
					<BouncyPressable
						key={index}
						style={styles.historyItem}
						onPress={() => handleChatPress(item.id)}
					>
						<View style={styles.historyContent}>
							<Text style={styles.historyTitle}>
								{getHistoryTitle(item.type)}
							</Text>
							<Text style={styles.lastMessage} numberOfLines={1}>
								{getHistoryContent(item)}
							</Text>
						</View>
						<Ionicons name="chevron-forward" size={24} color={colors.white} />
					</BouncyPressable>
				)}
			/>
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
