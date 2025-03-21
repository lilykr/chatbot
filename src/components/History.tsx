import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { storage } from "../services/storage";
import type { App } from "../types/apps";
import { BouncyPressable } from "./BouncyPressable";
import { Text } from "./Text";
const LOGO = require("../../assets/avatar.png");
const LLK_AVATAR = require("../../assets/llk.png");

const getHistoryTitle = (type: App["type"]) => {
	switch (type) {
		case "chat":
			return "AI Chatbot";
		case "voice":
			return "Voice Mode";
		case "rant":
			return "AI Rant";
		case "chatWithLily":
			return "Lisa-Lou's chatbot";
		default:
			return "";
	}
};

const getHistoryContent = (item: App) => {
	switch (item.type) {
		case "chat":
		case "voice":
		case "chatWithLily":
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
				renderItem={({ item }) => (
					<BouncyPressable
						key={item.id}
						style={styles.historyItem}
						onPress={() => handleChatPress(item.id)}
					>
						<View style={styles.historyContainer}>
							<Image
								source={item.type === "chatWithLily" ? LLK_AVATAR : LOGO}
								style={styles.logo}
							/>
							<View style={styles.historyContent}>
								<Text style={styles.historyTitle}>
									{getHistoryTitle(item.type)}
								</Text>
								<Text style={styles.lastMessage} numberOfLines={1}>
									{getHistoryContent(item)}
								</Text>
							</View>
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
	},
	title: {
		color: colors.white,
		fontSize: 20,
		marginBottom: 16,
	},
	historyItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
	},
	historyContainer: {
		marginRight: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	historyContent: {
		marginLeft: 16,
		flex: 1,
	},
	logo: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.lightGrey,
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
