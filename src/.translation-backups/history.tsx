import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { type HistoryItem, storage } from "../services/storage";
import { getAppImage } from "../utils/getAppImage";
import { getHistoryContent, getHistoryTitle } from "../utils/history";
import { BouncyPressable } from "./BouncyPressable";
import { Text } from "./Text";
export const History = () => {
	const [histories, setHistories] = useState(storage.get("history"));

	const handleChatPress = (item: HistoryItem) => {
		if (item.type === "chatWithLily") {
			router.push(`/chatWithLily/${item.id}`);
		} else if (item.type === "rant") {
			router.push(`/aiRant/${item.id}`);
		} else {
			router.push(`/chat/${item.id}`);
		}
	};

	useEffect(() => {
		storage.listen("history", (newHistory) => {
			setHistories(newHistory);
		});
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.headerContainer}>
				<Text weight="medium" style={styles.title}>
					History
				</Text>
				<BouncyPressable onPress={() => router.push("/history")}>
					<Text style={styles.seeAll}>See all</Text>
				</BouncyPressable>
			</View>
			{!histories?.length ? (
				<View style={styles.emptyContainer}>
					<MaterialCommunityIcons
						name="cat"
						size={48}
						color={colors.lightGrey}
					/>
					<Text style={styles.emptyText}>Wow, such empty!</Text>
					<Text style={styles.emptySubtext}>
						Your chat history will appear here
					</Text>
				</View>
			) : (
				<View>
					{histories
						?.sort((a, b) => b.updatedAt - a.updatedAt)
						.slice(0, 4)
						.map((item) => (
							<BouncyPressable
								key={item.id}
								style={styles.historyItem}
								onPress={() => handleChatPress(item)}
							>
								<View style={styles.historyContainer}>
									<Image source={getAppImage(item.type)} style={styles.logo} />
									<View style={styles.historyContent}>
										<Text style={styles.historyTitle}>
											{getHistoryTitle(item.type)}
										</Text>
										<Text style={styles.lastMessage} numberOfLines={1}>
											{getHistoryContent(item)}
										</Text>
									</View>
								</View>
								<Ionicons
									name="chevron-forward"
									size={24}
									color={colors.white}
								/>
							</BouncyPressable>
						))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 8,
		paddingHorizontal: 16,
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	title: {
		color: colors.white,
		fontSize: 20,
	},
	seeAll: {
		color: colors.lightGrey,
		fontSize: 16,
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
		width: "100%",
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
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
		opacity: 0.7,
	},
	emptyText: {
		color: colors.white,
		fontSize: 18,
		marginTop: 12,
	},
	emptySubtext: {
		color: colors.lightGrey,
		fontSize: 14,
		marginTop: 8,
	},
});
