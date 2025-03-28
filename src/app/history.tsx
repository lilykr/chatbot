import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BouncyPressable } from "../components/BouncyPressable";
import { Header } from "../components/Header";
import { Text } from "../components/Text";
import { colors } from "../constants/colors";
import { useI18n } from "../i18n/i18n";
import { type HistoryItem, storage } from "../services/storage";
import { getAppImage } from "../utils/getAppImage";
import { getHistoryContent, getHistoryTitle } from "../utils/history";

export default function HistoryPage() {
	const { t } = useI18n();
	const insets = useSafeAreaInsets();

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
		<>
			<Header title={t("app.history")} type="history" />
			<ScrollView
				style={styles.container}
				contentContainerStyle={{ paddingTop: insets.top + 40 }}
			>
				<View style={styles.content}>
					{histories
						?.sort((a, b) => b.updatedAt - a.updatedAt)
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
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
		height: "100%",
	},
	content: {
		padding: 16,
	},
	historyItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		borderRadius: 12,
		marginBottom: 8,
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
